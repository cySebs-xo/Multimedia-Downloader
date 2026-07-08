import type { Request, Response, NextFunction } from 'express';
import { getMediaInfo as ytDlpGetMediaInfo } from '../services/ytDlpService';
import { youtubeService } from '../services/youtubeService';
import { instagramService } from '../services/instagramService';
import { isSupportedPlatform, detectPlatform } from '../services/platformService';
import { logger } from '../utils/logger';

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

    let info;

    if (platform === 'youtube') {
      info = await youtubeService.getMediaInfo(url);
    } else if (platform === 'instagram') {
      info = await instagramService.getMediaInfo(url);
    } else {
      info = await ytDlpGetMediaInfo(url, platform);
      info.platform = platform;
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
