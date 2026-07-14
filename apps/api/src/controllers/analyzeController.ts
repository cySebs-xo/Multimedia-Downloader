import type { Request, Response, NextFunction } from 'express';
import { getMediaInfo as ytDlpGetMediaInfo } from '../services/ytDlpService';
import { youtubeService } from '../services/youtubeService';
import { instagramService } from '../services/instagramService';
import { isSupportedPlatform, detectPlatform } from '../services/platformService';
import { logger } from '../utils/logger';
import type { MediaInfo } from '../types/media';

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: MediaInfo; ts: number }>();

function getCached(url: string): MediaInfo | null {
  const entry = cache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(url);
    return null;
  }
  return entry.data;
}

function setCache(url: string, data: MediaInfo): void {
  if (cache.size > 500) {
    const oldest = cache.entries().next().value;
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(url, { data, ts: Date.now() });
}

export async function analyzeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { url } = req.body as { url: string };

    if (!isSupportedPlatform(url)) {
      res.status(422).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_PLATFORM',
          message: `La plataforma no es compatible. URL: ${url}`,
        },
      });
      return;
    }

    const platform = detectPlatform(url);
    logger.debug(`Analyzing URL: ${url} (platform: ${platform})`);

    if (platform === 'twitch' || platform === 'facebook' || platform === 'twitter' || platform === 'soundcloud' || platform === 'youtube' || platform === 'instagram' || platform === 'tiktok' || platform === 'vimeo' || platform === 'reddit' || platform === 'pinterest' || platform === 'linkedin' || platform === 'youtube_music') {
      const cached = getCached(url);
      if (cached) {
        res.json({ success: true, data: cached });
        return;
      }
    }
 
    let info;

    if (platform === 'youtube') {
      info = await youtubeService.getMediaInfo(url);
    } else if (platform === 'instagram') {
      info = await instagramService.getMediaInfo(url);
    } else {
      info = await ytDlpGetMediaInfo(url, platform);
      info.platform = platform;
    }

    if (platform === 'twitch' || platform === 'facebook' || platform === 'twitter' || platform === 'soundcloud' || platform === 'youtube' || platform === 'instagram' || platform === 'tiktok' || platform === 'vimeo' || platform === 'reddit' || platform === 'pinterest' || platform === 'linkedin' || platform === 'youtube_music') {
      setCache(url, info);
    }

    if (info.thumbnail && info.platform === 'instagram') {
      const proto = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers['x-forwarded-host'] || req.get('host');
      info.thumbnail = `${proto}://${host}/thumbnail?url=${encodeURIComponent(info.thumbnail)}`;
    }

    res.json({
      success: true,
      data: info,
    });
  } catch (err) {
    next(err);
  }
}
