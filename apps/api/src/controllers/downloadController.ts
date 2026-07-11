import path from 'path';
import fs from 'fs';
import type { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { downloadMedia } from '../services/ytDlpService';
import { youtubeService } from '../services/youtubeService';
import { instagramService } from '../services/instagramService';
import { detectPlatform } from '../services/platformService';
import { extractAudio } from '../services/ffmpegService';
import { deleteFile } from '../utils/cleanup';
import { logger } from '../utils/logger';

const TEMP_DIR = process.env.TEMP_DIR || './temp';

const CONTENT_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

async function handleDiskDownload(
  url: string,
  platform: string,
  formatId: string,
  format: 'mp4' | 'mp3' | 'wav',
  type: 'video' | 'audio',
  res: Response
): Promise<void> {
  const tempId = uuidv4();
  const rawPath = path.join(TEMP_DIR, `${tempId}_raw`);
  const outputPath = path.join(TEMP_DIR, `${tempId}.${format}`);

  logger.debug(`Downloading via yt-dlp: ${url} (format: ${formatId})`);

  await downloadMedia(url, formatId, rawPath, platform, format);

  function resolveRawPath(): string {
    if (fs.existsSync(rawPath)) return rawPath;
    const dir = path.dirname(rawPath);
    const base = path.basename(rawPath);
    const files = fs.readdirSync(dir);
    const match = files.find(f => f.startsWith(base + '.'));
    return match ? path.join(dir, match) : rawPath;
  }

  const actualRawPath = resolveRawPath();
  let finalPath: string;

  if (type === 'audio' && (format === 'mp3' || format === 'wav')) {
    logger.debug(`Converting audio to ${format}`);
    await extractAudio(actualRawPath, format, outputPath);
    finalPath = outputPath;
  } else {
    finalPath = actualRawPath;
  }

  const contentType = CONTENT_TYPES[format] || 'application/octet-stream';
  const filename = `download.${format}`;
  const stats = fs.statSync(finalPath);

  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stats.size);

  const readStream = fs.createReadStream(finalPath);
  readStream.pipe(res);

  readStream.on('error', (err) => {
    logger.error(`Stream error: ${err.message}`);
  });

  res.on('close', async () => {
    await deleteFile(rawPath);
    const dir = path.dirname(rawPath);
    const base = path.basename(rawPath);
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith(base + '.') || f.startsWith(base + '_')) {
        await deleteFile(path.join(dir, f));
      }
    }
    if (outputPath !== rawPath) {
      await deleteFile(outputPath);
    }
  });
}

export async function downloadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { url, type, format, formatId, quality } = req.body as {
    url: string;
    type: 'video' | 'audio';
    format: 'mp4' | 'mp3' | 'wav';
    quality: string;
    formatId: string;
  };

  const platform = detectPlatform(url);

  try {
    if (platform === 'youtube') {
      if (type === 'video') {
        await youtubeService.downloadVideo(url, quality, format as 'mp4', res);
      } else {
        await youtubeService.downloadAudio(url, format as 'mp3' | 'wav', res);
      }
    } else if (platform === 'instagram') {
      if (type === 'audio') {
        await instagramService.downloadAudio(url, format as 'mp3' | 'wav', res);
      } else {
        await instagramService.download(url, format as 'mp4', res);
      }
    } else {
      await handleDiskDownload(url, platform, formatId, format, type, res);
    }
  } catch (err) {
    if ((platform === 'youtube' || platform === 'instagram') && !res.headersSent) {
      logger.warn(`Fallback to yt-dlp for ${platform}: ${(err as Error).message}`);
      const isDefault = formatId === 'default' || formatId.startsWith('default+');
      let fbFormatId: string;
      if (isDefault) {
        fbFormatId = platform === 'youtube'
          ? type === 'video' ? 'bestvideo+bestaudio/best' : 'bestaudio/best'
          : 'best';
      } else if (platform === 'youtube' && type === 'video' && !formatId.includes('+')) {
        fbFormatId = `${formatId}+bestaudio`;
      } else {
        fbFormatId = formatId;
      }
      try {
        await handleDiskDownload(url, platform, fbFormatId, format, type, res);
      } catch (fallbackErr) {
        next(fallbackErr);
      }
      return;
    }
    next(err);
  }
}
