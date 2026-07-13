const SUPPORTED_PLATFORMS: Record<string, string> = {
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'tiktok.com': 'tiktok',
  'instagram.com': 'instagram',
  'soundcloud.com': 'soundcloud',
  'vimeo.com': 'vimeo',
  'twitch.tv': 'twitch',
  'facebook.com': 'facebook',
  'fb.watch': 'facebook',
  'twitter.com': 'twitter',
  'x.com': 'twitter',
  'reddit.com': 'reddit',
  'pinterest.com': 'pinterest',
  'pin.it': 'pinterest',
  'linkedin.com': 'linkedin',
  'open.spotify.com': 'spotify',
  'music.apple.com': 'apple_music',
  'spotify.com': 'spotify',
  'deezer.com': 'deezer',
  'music.youtube.com': 'youtube_music',
  'bandlab.com': 'bandlab',
};

export function detectPlatform(url: string): string {
  const hostname = new URL(url).hostname.replace('www.', '');
  for (const [domain, name] of Object.entries(SUPPORTED_PLATFORMS)) {
    if (hostname.endsWith(domain)) return name;
  }
  return 'unknown :[';
}

export function isSupportedPlatform(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return Object.keys(SUPPORTED_PLATFORMS).some(d => hostname.endsWith(d));
  } catch {
    return false;
  }
}
