import type { Response } from 'express';
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
      logger.warn(`yt-dlp failed for Instagram analyze, falling back to oEmbed: ${(ytErr as Error).message}`);
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
