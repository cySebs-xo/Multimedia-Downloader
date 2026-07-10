import { spawn, execFileSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { logger } from '../utils/logger';
import { getWarpProxyUrl } from '../utils/warp';
import type { MediaInfo, VideoFormat, AudioFormat, ContentType } from '../types/media';

let _ytDlpPath: string | null = null;

function getYtDlpPath(): string {
  if (_ytDlpPath) return _ytDlpPath;

  const CANDIDATES: string[] = [
    process.env.YTDLP_PATH,
    'yt-dlp',
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    path.join(__dirname, '../../bin/yt-dlp'),
    path.join(os.homedir(), '.local/bin/yt-dlp'),
  ].filter(Boolean) as string[];

  for (const candidate of CANDIDATES) {
    if (candidate === 'yt-dlp') {
      try {
        const ver = execFileSync('yt-dlp', ['--version'], { encoding: 'utf-8' }).trim();
        logger.info(`yt-dlp version ${ver} found in PATH`);
        _ytDlpPath = 'yt-dlp';
        return _ytDlpPath;
      } catch {
        continue;
      }
    }
    if (fs.existsSync(candidate)) {
      const ver = execFileSync(candidate, ['--version'], { encoding: 'utf-8' }).trim();
      logger.info(`yt-dlp version ${ver} found at ${candidate}`);
      _ytDlpPath = candidate;
      return _ytDlpPath;
    }
  }

  logger.error('yt-dlp not found. Checked: ' + CANDIDATES.join(', '));
  throw new Error('yt-dlp not found. Run scripts/install.sh');
}

type YtDlpFormat = {
  format_id: string;
  ext: string;
  resolution: number | null;
  width: number | null;
  height: number | null;
  filesize: number | null;
  vcodec: string;
  acodec: string;
  tbr: number | null;
};

type YtDlpThumbnail = {
  url: string;
  height: number | null;
  width: number | null;
};

type YtDlpDump = {
  title: string;
  thumbnail: string | null;
  thumbnails?: YtDlpThumbnail[];
  duration: number | null;
  formats: YtDlpFormat[];
  ext: string;
};

function buildPlatformArgs(platform: string, extra: string[] = []): string[] {
  const nodePath = process.execPath;
  const base = [
    ...extra,
    '--no-playlist',
    '--force-ipv4',
    '--extractor-retries', '5',
    '--retry-sleep', '5',
    '--sleep-requests', '1',
    '--js-runtimes', `node:${nodePath}`,
  ];

  if (platform === 'youtube' || platform === 'instagram') {
    base.push(
      '--geo-bypass',
      '--socket-timeout', '30',
      '--extractor-args',
      'youtube:player_client=android_vr,tv_downgraded,web_creator;formats=duplicate,missing_pot',
    );

    const proxyUrl = getWarpProxyUrl();
    if (proxyUrl) {
      base.push('--proxy', proxyUrl);
    }

  }

  return base;
}

type SpawnResult = {
  stdout: string;
  stderr: string;
};

const YT_ERROR_CODES: Array<{ pattern: RegExp; code: string; message: string }> = [
  { pattern: /private video|login required|sign in|confirm your age|bot/i, code: 'PRIVATE_CONTENT', message: 'Este contenido es privado o requiere inicio de sesión.' },
  { pattern: /not available|geo|blocked|country/i, code: 'GEO_RESTRICTED', message: 'Este contenido no está disponible en tu región.' },
  { pattern: /not found|does not exist|404/i, code: 'CONTENT_NOT_FOUND', message: 'Este contenido no existe o ha sido eliminado.' },
];

export function mapStderrError(stderr: string): { code: string; message: string } | null {
  for (const entry of YT_ERROR_CODES) {
    if (entry.pattern.test(stderr)) {
      return { code: entry.code, message: entry.message };
    }
  }
  return null;
}

function spawnYtDlp(ytDlpPath: string, args: string[], timeoutMs: number): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpPath, args);
    let stdout = '';
    let stderr = '';

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill();
      reject(Object.assign(new Error('Tiempo de espera agotado.'), { code: 'DOWNLOAD_FAILED' }));
    }, timeoutMs);

    proc.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on('error', (err: NodeJS.ErrnoException) => {
      clearTimeout(timer);
      if (timedOut) return;
      if (err.code === 'ENOENT') {
        reject(Object.assign(new Error('yt-dlp no encontrado. Ejecuta scripts/install.sh'), { code: 'YTDLP_NOT_INSTALLED' }));
      } else {
        reject(Object.assign(new Error(`yt-dlp spawn failed: ${err.message}`), { code: 'DOWNLOAD_FAILED' }));
      }
    });

    proc.on('close', (code: number | null) => {
      clearTimeout(timer);
      if (timedOut) return;

      if (code !== 0) {
        const snippet = stderr.slice(0, 600);
        logger.error(`yt-dlp exit code ${code}. stderr snippet: ${snippet}`);
        const mapped = mapStderrError(stderr);
        if (mapped) {
          reject(Object.assign(new Error(mapped.message), { code: mapped.code }));
        } else {
          reject(Object.assign(new Error('Error al descargar la información del video.'), { code: 'DOWNLOAD_FAILED' }));
        }
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}

export async function getMediaInfo(url: string, platform: string): Promise<MediaInfo> {
  const ytDlpPath = getYtDlpPath();
  const args = [...buildPlatformArgs(platform), '--dump-json', url];

  logger.debug(`Spawning: ${ytDlpPath} ${args.join(' ')}`);

  try {
    const { stdout } = await spawnYtDlp(ytDlpPath, args, 60_000);
    const lines = stdout.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const data: YtDlpDump = JSON.parse(lastLine);

    const contentType: ContentType = data.formats.every((f: YtDlpFormat) => f.vcodec === 'none') ? 'audio' : 'video';

    const combinedFormats: YtDlpFormat[] = data.formats.filter((f: YtDlpFormat) =>
      !['none', undefined, null].includes(f.vcodec) &&
      f.vcodec !== '' &&
      !['none', undefined, null].includes(f.acodec) &&
      f.acodec !== '' &&
      ['mp4', 'webm'].includes(f.ext) &&
      (f.height != null && f.height > 0)
    );

    const videoFormats: VideoFormat[] = (contentType === 'audio' ? [] : data.formats)
      .filter((f: YtDlpFormat) => {
        if (contentType === 'audio') return false;
        return !['none', undefined, null].includes(f.vcodec) &&
               f.vcodec !== '' &&
               ['mp4', 'webm'].includes(f.ext) &&
               (f.height != null && f.height > 0);
      })
      .map((f: YtDlpFormat): VideoFormat => ({
        id: f.format_id,
        quality: f.height ? `${f.height}p` : `${f.tbr ? Math.round(f.tbr) : 0}k`,
        ext: f.ext as 'mp4' | 'webm',
        filesize: f.filesize,
      }))
      .sort((a: VideoFormat, b: VideoFormat) => {
        const aNum = parseInt(a.quality);
        const bNum = parseInt(b.quality);
        return bNum - aNum;
      });

    if (!videoFormats.some(f => f.ext === 'webm') && videoFormats.length > 0) {
      const best = videoFormats[0];
      videoFormats.push({ ...best, ext: 'webm' });
    }

    const pureAudioFormats = data.formats
      .filter((f: YtDlpFormat) => {
        const isAudioOnly = f.vcodec === 'none' || f.vcodec === '' || f.vcodec == null;
        const hasAudio = f.acodec !== 'none' && f.acodec !== '' && f.acodec != null;
        return isAudioOnly && hasAudio;
      });

    const audioFormats: AudioFormat[] = (pureAudioFormats.length > 0 ? pureAudioFormats : combinedFormats)
      .map((f: YtDlpFormat): AudioFormat => ({
        id: f.format_id,
        quality: f.tbr ? `${Math.round(f.tbr)}kbps` : 'unknown',
        ext: f.ext as 'm4a' | 'mp3' | 'wav',
      }))
      .sort((a: AudioFormat, b: AudioFormat) => {
        const aNum = parseInt(a.quality);
        const bNum = parseInt(b.quality);
        return bNum - aNum;
      });

    const thumb = data.thumbnail ?? data.thumbnails?.[0]?.url ?? null;

    return {
      title: data.title,
      thumbnail: thumb,
      duration: data.duration != null ? Math.round(data.duration) : null,
      platform,
      contentType,
      formats: {
        video: videoFormats,
        audio: audioFormats,
      },
    };
  } catch (err) {
    const error = err as Error & { code?: string };
    if (!error.code) {
      throw Object.assign(new Error('Error al procesar la respuesta de yt-dlp.'), { code: 'DOWNLOAD_FAILED' });
    }
    throw error;
  }
}

export async function downloadMedia(url: string, formatId: string, outputPath: string, platform: string, mergeFormat?: string, recode?: string): Promise<string> {
  const ytDlpPath = getYtDlpPath();
  const isMerged = formatId.includes('+');
  const mf = mergeFormat || 'mp4';

  if (recode) {
    // --recode-video re-encodes to target format if needed, handles merging internally
    const args = [...buildPlatformArgs(platform), '-f', formatId, '-o', `${outputPath}.%(ext)s`, '--recode-video', recode, url];
    logger.debug(`Spawning: ${ytDlpPath} ${args.join(' ')}`);
    try {
      await spawnYtDlp(ytDlpPath, args, 300_000);
      return outputPath;
    } catch (err) {
      const error = err as Error & { code?: string };
      if (!error.code) {
        throw Object.assign(new Error('Error al descargar el archivo multimedia.'), { code: 'DOWNLOAD_FAILED' });
      }
      throw error;
    }
  }

  const args = isMerged
    ? [...buildPlatformArgs(platform), '-f', formatId, '-o', `${outputPath}.%(ext)s`, '--merge-output-format', mf, url]
    : [...buildPlatformArgs(platform), '-f', formatId, '-o', outputPath, url];

  logger.debug(`Spawning: ${ytDlpPath} ${args.join(' ')}`);

  try {
    await spawnYtDlp(ytDlpPath, args, 300_000);
    return outputPath;
  } catch (err) {
    const error = err as Error & { code?: string };
    if (!error.code) {
      throw Object.assign(new Error('Error al descargar el archivo multimedia.'), { code: 'DOWNLOAD_FAILED' });
    }
    throw error;
  }
}
