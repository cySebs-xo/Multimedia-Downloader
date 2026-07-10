import { Innertube, ClientType } from 'youtubei.js';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import type { Response } from 'express';
import { logger } from '../utils/logger';
import type { MediaInfo, VideoFormat, AudioFormat } from '../types/media';
import { getMediaInfo as ytDlpGetMediaInfo } from './ytDlpService';

function mimeToExt(mime: string): string {
  const match = mime.match(/^[^/]+\/([\w-]+)/);
  return match?.[1] || 'mp4';
}

class YouTubeService {
  private yt: Innertube | null = null;

  private async getInstance(): Promise<Innertube> {
    if (!this.yt) {
      this.yt = await Innertube.create({ client_type: ClientType.ANDROID });
      logger.info('youtubei.js Innertube instance created (ANDROID client)');
    }
    return this.yt;
  }

  private extractVideoId(url: string): string | null {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    return match?.[1] ?? null;
  }

  async getMediaInfo(url: string): Promise<MediaInfo> {
    // 1. Try youtubei.js for rich format data
    try {
      const youtube = await this.getInstance();
      const videoId = this.extractVideoId(url);

      if (!videoId) {
        throw Object.assign(new Error('URL de YouTube no válida.'), { code: 'INVALID_URL' });
      }

      const info = await youtube.getBasicInfo(videoId);

      if (!info.basic_info.title) {
        throw new Error('youtubei.js returned incomplete data (no title)');
      }

      const title = info.basic_info.title || `youtube_${videoId}`;
      const duration = info.basic_info.duration ?? null;

      const thumbs = info.basic_info.thumbnail || [];
      const thumbnail = thumbs.sort((a, b) => b.width - a.width)[0]?.url
        || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const progressive = info.streaming_data?.formats || [];
      const adaptive = info.streaming_data?.adaptive_formats || [];

      // Merge progressive (video+audio) and adaptive (video-only) for more quality options
      const allVideo = [...progressive, ...adaptive]
        .filter(f => f.has_video && f.height && f.height > 0)
        .map(f => ({
          id: String(f.itag),
          quality: f.quality_label || `${f.height}p`,
          ext: mimeToExt(f.mime_type),
          filesize: f.content_length ?? null,
        }));

      // Deduplicate by (quality, ext) — progressive comes first so it wins ties
      const seenQualities = new Set<string>();
      const videoFormats: VideoFormat[] = allVideo
        .filter(f => {
          const key = `${f.quality}_${f.ext}`;
          if (seenQualities.has(key)) return false;
          seenQualities.add(key);
          return true;
        })
        .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

      if (videoFormats.length === 0) {
        videoFormats.push({ id: 'default', quality: '720p', ext: 'mp4', filesize: null });
      }

      const audioFormats: AudioFormat[] = adaptive.length > 0
        ? adaptive
            .filter(f => f.has_audio && !f.has_video)
            .map(f => ({
              id: String(f.itag),
              quality: `${Math.round(f.bitrate / 1000)}kbps`,
              ext: mimeToExt(f.mime_type),
            }))
        : [{ id: 'default', quality: '128kbps', ext: 'm4a' }];

      const contentType = videoFormats.length > 0 ? 'video' : 'audio';

      return {
        title,
        thumbnail,
        duration,
        platform: 'youtube',
        contentType,
        formats: {
          video: videoFormats,
          audio: audioFormats,
        },
      };
    } catch (ytErr) {
      logger.warn(`youtubei.js getMediaInfo failed: ${(ytErr as Error).message}`);
    }

    // 2. Fallback: yt-dlp (works with WARP proxy, returns full metadata)
    logger.info('Falling back to yt-dlp for YouTube metadata');
    return ytDlpGetMediaInfo(url, 'youtube');
  }

  async downloadVideo(
    url: string,
    quality: string,
    format: 'mp4' | 'webm',
    res: Response
  ): Promise<void> {
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      res.status(400).json({ success: false, error: { code: 'INVALID_URL', message: 'URL de YouTube no válida.' } });
      return;
    }

    const youtube = await this.getInstance();
    const info = await youtube.getBasicInfo(videoId);

    if (!info.streaming_data) {
      throw Object.assign(new Error('No streaming_data available. Use yt-dlp fallback.'), { code: 'DOWNLOAD_FAILED' });
    }

    // youtubei.js only outputs mp4 for progressive streams; webm must go through yt-dlp
    if (format === 'webm') {
      throw Object.assign(new Error('youtubei.js does not output webm; falling back to yt-dlp'), { code: 'DOWNLOAD_FAILED' });
    }

    const rawTitle = info.basic_info.title || `youtube_${videoId}`;
    const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_');

    const streamOpts = { type: 'video+audio' as const, quality };
    const ext = 'mp4';
    const contentTypeV = 'video/mp4';

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanTitle)}.${ext}"`);
    res.setHeader('Content-Type', contentTypeV);

    const stream = await info.download(streamOpts);
    const nodeStream = Readable.from(stream);
    nodeStream.pipe(res);

    nodeStream.on('error', (err) => {
      logger.error('youtubei.js stream error:', err);
      if (!res.headersSent) {
        res.status(502).json({ success: false, error: { code: 'DOWNLOAD_FAILED', message: 'Error al descargar el video.' } });
      }
    });
  }

  async downloadAudio(
    url: string,
    format: 'mp3' | 'wav',
    res: Response
  ): Promise<void> {
    const videoId = this.extractVideoId(url);

    if (!videoId) {
      res.status(400).json({ success: false, error: { code: 'INVALID_URL', message: 'URL de YouTube no válida.' } });
      return;
    }

    const youtube = await this.getInstance();
    const info = await youtube.getBasicInfo(videoId);

    if (!info.streaming_data) {
      throw Object.assign(new Error('No streaming_data available. Use yt-dlp fallback.'), { code: 'DOWNLOAD_FAILED' });
    }

    const rawTitle = info.basic_info.title || `youtube_${videoId}`;
    const cleanTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, '_');

    const streamOpts = { type: 'audio' as const, quality: 'best' as const };
    const stream = await info.download(streamOpts);
    const nodeStream = Readable.from(stream);

    const audioCodec = format === 'mp3' ? 'libmp3lame' : 'pcm_s16le';
    const contentTypeA = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
    const outputFormat = format === 'mp3' ? 'mp3' : 'wav';

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanTitle)}.${format}"`);
    res.setHeader('Content-Type', contentTypeA);

    const command = ffmpeg(nodeStream)
      .audioCodec(audioCodec)
      .format(outputFormat);

    if (format === 'mp3') {
      command.audioBitrate(320);
    }
    if (format === 'wav') {
      command.audioFrequency(44100);
    }

    command.on('error', (err) => {
      logger.error('youtubei.js audio FFmpeg error:', err);
      if (!res.headersSent) {
        res.status(502).json({ success: false, error: { code: 'CONVERSION_FAILED', message: 'Error al convertir el audio.' } });
      }
    });

    command.pipe(res, { end: true });
  }
}

export const youtubeService = new YouTubeService();
