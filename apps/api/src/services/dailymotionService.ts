import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import ffmpeg from 'fluent-ffmpeg';
import { logger } from '../utils/logger';
import type { MediaInfo, VideoFormat, AudioFormat } from '../types/media';
import { deleteFile } from '../utils/cleanup';

const TEMP_DIR = process.env.TEMP_DIR || './temp';
const METADATA_API = 'https://www.dailymotion.com/player/metadata/video';

type Variant = {
  bandwidth: number;
  width: number;
  height: number;
  name: string;
  url: string;
};

class DailymotionService {
  private baseHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://www.dailymotion.com',
    'Referer': 'https://www.dailymotion.com/',
  };

  private blockbusterHeaders(): Record<string, string> {
    const chars = 'bcdfghjklmnpqrstvwxz';
    const randomLetters = (min: number, max: number): string => {
      const len = min + Math.floor(Math.random() * (max - min + 1));
      let result = '';
      for (let i = 0; i < len; i++) result += chars[Math.floor(Math.random() * chars.length)];
      return result;
    };
    const headers: Record<string, string> = { ...this.baseHeaders };
    const count = 3 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      headers[randomLetters(10, 20)] = randomLetters(16, 28);
    }
    return headers;
  }

  private extractVideoId(url: string): string {
    const match = url.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
    if (!match) throw Object.assign(new Error('URL de Dailymotion no válida.'), { code: 'INVALID_URL' });
    return match[1];
  }

  private async fetchJson(url: string, useBlockbuster = false): Promise<any> {
    const resp = await fetch(url, { headers: useBlockbuster ? this.blockbusterHeaders() : this.baseHeaders });
    if (!resp.ok) throw new Error(`Dailymotion API error: HTTP ${resp.status}`);
    return resp.json();
  }

  private httpsGet(url: string, useBlockbuster: boolean): Promise<{ status: number; body: string; buffer: Buffer }> {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const mod = u.protocol === 'https:' ? https : http;
      const opts: http.RequestOptions = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: useBlockbuster ? this.blockbusterHeaders() : this.baseHeaders,
      };
      const req = mod.request(opts, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({ status: res.statusCode || 0, body: buffer.toString('utf8'), buffer });
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  private async fetchText(url: string, useBlockbuster = false): Promise<string> {
    const { status, body } = await this.httpsGet(url, useBlockbuster);
    if (status !== 200) throw new Error(`Dailymotion request error: HTTP ${status}`);
    return body;
  }

  private async fetchBuffer(url: string, useBlockbuster = false): Promise<Buffer> {
    const { status, buffer } = await this.httpsGet(url, useBlockbuster);
    if (status !== 200) throw new Error(`Dailymotion request error: HTTP ${status}`);
    return buffer;
  }

  private parseMasterM3u8(m3u8: string): Variant[] {
    const variants: Variant[] = [];
    const lines = m3u8.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed.startsWith('#EXT-X-STREAM-INF:')) continue;
      const attrs = trimmed.substring('#EXT-X-STREAM-INF:'.length);
      const bw = parseInt(attrs.match(/BANDWIDTH=(\d+)/)?.[1] || '0');
      const resMatch = attrs.match(/RESOLUTION=(\d+)x(\d+)/);
      const width = resMatch ? parseInt(resMatch[1]) : 0;
      const height = resMatch ? parseInt(resMatch[2]) : 0;
      const name = attrs.match(/NAME="([^"]+)"/)?.[1] || `${height}`;

      const urlLine = lines[i + 1]?.trim() || '';
      const url = urlLine.split('#')[0];

      if (url) {
        variants.push({ bandwidth: bw, width, height, name, url });
      }
    }
    return variants;
  }

  async getMediaInfo(url: string): Promise<MediaInfo> {
    const videoId = this.extractVideoId(url);
    const meta = await this.fetchJson(`${METADATA_API}/${videoId}`);

    if (meta.error) {
      const msg = meta.error.title || meta.error.raw_message || 'Unknown error';
      if (meta.error.code === 'DM007') {
        throw Object.assign(new Error(msg), { code: 'GEO_RESTRICTED' });
      }
      throw Object.assign(new Error(`Dailymotion: ${msg}`), { code: 'CONTENT_NOT_FOUND' });
    }

    const title = meta.title || `dailymotion_${videoId}`;
    const duration = meta.duration ? Math.round(meta.duration) : null;

    const posters = meta.posters;
    const thumbnail = typeof posters === 'object' && posters !== null
      ? (Object.values(posters)[0] as string | undefined)
      : undefined;
    const thumb = thumbnail || null;

    const m3u8Url = meta.qualities?.auto?.[0]?.url;
    if (!m3u8Url) {
      throw Object.assign(new Error('No se encontraron formatos para este video de Dailymotion.'), { code: 'DOWNLOAD_FAILED' });
    }

    const masterM3u8 = await this.fetchText(m3u8Url, true);
    const variants = this.parseMasterM3u8(masterM3u8);

    if (variants.length === 0) {
      throw Object.assign(new Error('No se encontraron formatos en la lista de reproducción.'), { code: 'DOWNLOAD_FAILED' });
    }

    const sorted = [...variants].sort((a, b) => b.height - a.height);

    const videoFormats: VideoFormat[] = sorted.map(v => ({
      id: `hls-${v.height}`,
      quality: `${v.height}p`,
      ext: 'mp4',
      filesize: v.bandwidth && duration ? Math.round(v.bandwidth / 8 * duration) : null,
    }));

    const sortedByBw = [...variants].sort((a, b) => b.bandwidth - a.bandwidth);

    const audioFormats: AudioFormat[] = sortedByBw.map(v => ({
      id: `hls-${v.height}`,
      quality: `${Math.round(v.bandwidth / 1000)}kbps`,
      ext: 'mp4',
      filesize: v.bandwidth && duration ? Math.round(v.bandwidth / 8 * duration) : null,
    }));

    return {
      title,
      thumbnail: thumb,
      duration,
      platform: 'dailymotion',
      contentType: 'video',
      formats: { video: videoFormats, audio: audioFormats },
    };
  }

  async download(url: string, formatId: string, res: Response): Promise<void> {
    const videoId = this.extractVideoId(url);
    const tempId = uuidv4();
    const outputPath = path.join(TEMP_DIR, `${tempId}.mp4`);

    try {
      await this.downloadHlsToFile(videoId, formatId, outputPath);

      const stats = fs.statSync(outputPath);
      const rawTitle = await this.getTitle(videoId);
      const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_');

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanTitle)}.mp4"`);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', stats.size);

      const readStream = fs.createReadStream(outputPath);
      readStream.pipe(res);

      readStream.on('error', (err) => logger.error(`Dailymotion stream error: ${err.message}`));

      res.on('close', () => {
        deleteFile(outputPath).catch(() => {});
      });
    } catch (err) {
      await deleteFile(outputPath).catch(() => {});
      throw err;
    }
  }

  async downloadAudio(url: string, format: 'mp3' | 'wav', res: Response): Promise<void> {
    const videoId = this.extractVideoId(url);
    const tempId = uuidv4();
    const mp4Path = path.join(TEMP_DIR, `${tempId}.mp4`);

    try {
      const meta = await this.fetchJson(`${METADATA_API}/${videoId}`);
      const m3u8Url = meta.qualities?.auto?.[0]?.url;
      if (!m3u8Url) throw new Error('No m3u8 URL found in metadata');

      const masterM3u8 = await this.fetchText(m3u8Url, true);
      const variants = this.parseMasterM3u8(masterM3u8);
      const best = [...variants].sort((a, b) => b.bandwidth - a.bandwidth)[0];
      const bestId = `hls-${best.height}`;

      await this.downloadHlsToFile(videoId, bestId, mp4Path);

      const rawTitle = meta.title || `dailymotion_${videoId}`;
      const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_');

      const audioCodec = format === 'mp3' ? 'libmp3lame' : 'pcm_s16le';
      const contentType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanTitle)}.${format}"`);
      res.setHeader('Content-Type', contentType);

      const command = ffmpeg(mp4Path)
        .noVideo()
        .audioCodec(audioCodec)
        .format(format);

      if (format === 'mp3') command.audioBitrate(320);
      if (format === 'wav') command.audioFrequency(44100);

      command.on('error', (err) => {
        logger.error(`Dailymotion audio FFmpeg error: ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            error: { code: 'CONVERSION_FAILED', message: 'Error al convertir el audio.' },
          });
        }
      });

      command.pipe(res, { end: true });

      res.on('close', () => {
        deleteFile(mp4Path).catch(() => {});
      });
    } catch (err) {
      await deleteFile(mp4Path).catch(() => {});
      throw err;
    }
  }

  private async downloadHlsToFile(videoId: string, formatId: string, outputPath: string): Promise<void> {
    const meta = await this.fetchJson(`${METADATA_API}/${videoId}`);
    const m3u8Url = meta.qualities?.auto?.[0]?.url;
    if (!m3u8Url) throw new Error('No m3u8 URL found in metadata');

    const masterM3u8 = await this.fetchText(m3u8Url, true);
    const variants = this.parseMasterM3u8(masterM3u8);

    const targetHeight = parseInt(formatId.replace('hls-', ''));
    const variant = variants.find(v => v.height === targetHeight)
      || [...variants].sort((a, b) => b.bandwidth - a.bandwidth)[0];

    const variantM3u8 = await this.fetchText(variant.url, true);
    const lines = variantM3u8.split('\n').map(l => l.trim()).filter(Boolean);

    const baseUrl = variant.url.substring(0, variant.url.lastIndexOf('/') + 1);
    const resolveUrl = (uri: string) => uri.startsWith('http') ? uri : baseUrl + uri;

    const initMatch = variantM3u8.match(/#EXT-X-MAP:URI="([^"]+)"/);
    const initUri = initMatch ? initMatch[1] : null;

    const chunks: Buffer[] = [];
    if (initUri) {
      const initData = await this.fetchBuffer(resolveUrl(initUri), true);
      chunks.push(initData);
    }

    for (const line of lines) {
      if (line.startsWith('#')) continue;
      const segUrl = resolveUrl(line);
      const data = await this.fetchBuffer(segUrl, true);
      chunks.push(data);
    }

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, Buffer.concat(chunks));
  }

  private async getTitle(videoId: string): Promise<string> {
    const meta = await this.fetchJson(`${METADATA_API}/${videoId}`);
    return meta.title || `dailymotion_${videoId}`;
  }
}

export const dailymotionService = new DailymotionService();
