import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from './logger';

const WARP_PROXY_PORT = 1080;
const WIREPROXY_VERSION = 'v1.1.2';

let warpProcess: ReturnType<typeof spawn> | null = null;

function getBinDir(): string {
  return path.join(__dirname, '../../bin');
}

function getWireproxyPath(): string {
  return path.join(getBinDir(), 'wireproxy');
}

function isWireproxyInstalled(): boolean {
  const candidates = [
    process.env.WIREPROXY_PATH,
    getWireproxyPath(),
    path.join(process.cwd(), 'bin/wireproxy'),
  ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) return true;
  }

  try {
    execSync('which wireproxy', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function downloadWireproxy(): Promise<boolean> {
  const arch = os.arch() === 'arm64' ? 'arm64' : 'amd64';
  const url = `https://github.com/pufferffish/wireproxy/releases/download/${WIREPROXY_VERSION}/wireproxy_linux_${arch}.tar.gz`;
  const dest = getWireproxyPath();

  try {
    fs.mkdirSync(getBinDir(), { recursive: true });
    const res = await fetch(url);
    if (!res.ok || !res.body) return false;

    const tmpFile = path.join(os.tmpdir(), 'wireproxy.tar.gz');
    const fileStream = fs.createWriteStream(tmpFile);
    const reader = res.body.getReader();

    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { fileStream.close(); break; }
        fileStream.write(Buffer.from(value));
      }
    };
    await pump();

    execSync(`tar -xzf ${tmpFile} -C ${getBinDir()} wireproxy`, { stdio: 'ignore' });
    fs.chmodSync(dest, 0o755);
    fs.unlinkSync(tmpFile);
    logger.info(`[warp] wireproxy downloaded to ${dest}`);
    return true;
  } catch (err) {
    logger.warn(`[warp] Failed to download wireproxy: ${(err as Error).message}`);
    return false;
  }
}

export function isWarpConfigured(): boolean {
  return !!process.env.WARP_PROFILE;
}

export function getWarpProxyUrl(): string | null {
  return isWarpConfigured() ? `socks5://127.0.0.1:${WARP_PROXY_PORT}` : null;
}

export async function startWarpProxy(): Promise<void> {
  if (!isWarpConfigured()) {
    logger.info('[warp] WARP_PROFILE not set — skipping');
    return;
  }

  if (!isWireproxyInstalled()) {
    logger.info('[warp] wireproxy not found — downloading...');
    const ok = await downloadWireproxy();
    if (!ok) {
      logger.warn('[warp] Could not get wireproxy binary — WARP unavailable');
      return;
    }
  }

  const configPath = path.join(os.tmpdir(), 'warp.conf');
  let config = process.env.WARP_PROFILE!;

  if (!config.includes('[Socks5]')) {
    config += `\n[Socks5]\nBindAddress = 127.0.0.1:${WARP_PROXY_PORT}\n`;
  }

  fs.writeFileSync(configPath, config, 'utf-8');

  return new Promise<void>((resolve) => {
    const proc = spawn(getWireproxyPath(), ['-c', configPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    warpProcess = proc;

    let started = false;

    proc.stderr!.on('data', (data: Buffer) => {
      const msg = data.toString();
      if (!started && msg.includes('Starting SOCKS5')) {
        started = true;
        logger.info(`[warp] WARP proxy ready on socks5://127.0.0.1:${WARP_PROXY_PORT}`);
        resolve();
      }
    });

    proc.on('error', (err: Error) => {
      logger.error(`[warp] Failed to start: ${err.message}`);
      warpProcess = null;
      if (!started) { started = true; resolve(); }
    });

    proc.on('exit', (code: number | null) => {
      logger.warn(`[warp] Exited with code ${code}`);
      warpProcess = null;
      if (!started) { started = true; resolve(); }
    });

    setTimeout(() => {
      if (!started) {
        started = true;
        logger.info('[warp] Proxy started (timeout fallback)');
        resolve();
      }
    }, 8000);
  });
}

export function stopWarpProxy(): void {
  if (warpProcess) {
    warpProcess.kill();
    warpProcess = null;
    logger.info('[warp] Proxy stopped');
  }
}
