import type { Response } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import type { MediaInfo } from '../types/media';
import { getMediaInfo as ytDlpGetMediaInfo } from './ytDlpService';

const OEMBED_URL = 'https://graph.facebook.com/v25.0/instagram_oembed';

interface OEmbedResponse {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  width?: number;
  height?: number;
}

class InstagramService {
  async getMediaInfo(url: string): Promise<MediaInfo> {
    try {
      const ytInfo = await ytDlpGetMediaInfo(url, 'instagram');
      const thumb = ytInfo.thumbnail || null;
      return {
        title: ytInfo.title,
        thumbnail: thumb,
        duration: ytInfo.duration ?? null,
        platform: 'instagram',
        contentType: 'video',
        formats: {
          video: [
            { id: 'default', quality: '720p', ext: 'mp4', filesize: ytInfo.formats.video[0]?.filesize ?? null },
          ],
          audio: [{ id: 'default', quality: '128kbps', ext: 'mp4', filesize: ytInfo.formats.audio[0]?.filesize ?? null }],
        },
      };
    } catch (ytErr) {
      logger.warn(`yt-dlp failed for Instagram, retrying with cookies: ${(ytErr as Error).message}`);
      try {
        const exec = promisify(execFile);
        const { stdout } = await exec('yt-dlp', [
          '--no-playlist', '--force-ipv4',
          '--cookies-from-browser', 'firefox',
          '--dump-json', url,
        ], { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });
        const lines = stdout.trim().split('\n');
        const data = JSON.parse(lines[lines.length - 1]);
        const thumb = data.thumbnail ?? data.thumbnails?.[0]?.url ?? null;
        const videoFmt = data.formats?.find((f: any) => f.height > 0 && f.ext === 'mp4');
        const audioFmt = data.formats?.find((f: any) => f.vcodec === 'none' && f.acodec !== 'none' && f.acodec != null);
        return {
          title: data.title ?? 'instagram_video',
          thumbnail: thumb,
          duration: data.duration ?? null,
          platform: 'instagram',
          contentType: 'video',
          formats: {
            video: [
              { id: 'default', quality: '720p', ext: 'mp4', filesize: videoFmt ? (videoFmt.filesize ?? videoFmt.filesize_approx ?? null) : null },
            ],
            audio: [
              { id: 'default', quality: '128kbps', ext: 'mp4', filesize: audioFmt ? (audioFmt.filesize ?? audioFmt.filesize_approx ?? null) : null },
            ],
          },
        };
      } catch (cookieErr) {
        logger.warn(`yt-dlp with cookies also failed, falling to oEmbed: ${(cookieErr as Error).message}`);
      }
    }

    const oembedRes = await fetch(
      `${OEMBED_URL}?url=${encodeURIComponent(url)}`
    );
    if (!oembedRes.ok) {
      throw Object.assign(new Error('No se pudo obtener información de este contenido de Instagram.'), { code: 'DOWNLOAD_FAILED' });
    }

    const data = (await oembedRes.json()) as OEmbedResponse;

    const title = data.title?.replace(/[/\\?%*:|"<>]/g, '_')
      || (data.author_name ? `Instagram video by ${data.author_name}` : 'instagram_video');
    const thumbnail = data.thumbnail_url || null;

    return {
      title,
      thumbnail,
      duration: null,
      platform: 'instagram',
      contentType: 'video',
      formats: {
        video: [
          { id: 'default', quality: '720p', ext: 'mp4', filesize: null },
        ],
        audio: [{ id: 'default', quality: '128kbps', ext: 'mp4', filesize: null }],
      },
    };
  }

  async download(_url: string, _format: 'mp4', _res: Response): Promise<void> {
    throw Object.assign(new Error('Instagram download requires yt-dlp fallback.'), { code: 'DOWNLOAD_FAILED' });
  }

  async downloadAudio(_url: string, _format: 'mp3' | 'wav', _res: Response): Promise<void> {
    throw Object.assign(new Error('Instagram audio download requires yt-dlp fallback.'), { code: 'DOWNLOAD_FAILED' });
  }
}

export const instagramService = new InstagramService();
