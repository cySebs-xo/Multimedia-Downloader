const PLATFORMS = [
  {
    name: 'YouTube',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'YT Music',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2.2a7.8 7.8 0 110 15.6 7.8 7.8 0 010-15.6z"/>
        <path d="M10 8.5v7l6-3.5-6-3.5z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    name: 'X',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.726-8.84L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'SoundCloud',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M11.5 17.5h.5c.3 0 .5-.2.5-.5V8.8c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5V17c0 .3.2.5.5.5zm-2 0h.5c.3 0 .5-.2.5-.5V9.5c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5V17c0 .3.2.5.5.5zm-2 0h.5c.3 0 .5-.2.5-.5v-6.5c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5V17c0 .3.2.5.5.5zm-2 0h.5c.3 0 .5-.2.5-.5v-5c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5V17c0 .3.2.5.5.5zm-2 0h.5c.3 0 .5-.2.5-.5v-3.5c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5V17c0 .3.2.5.5.5zm-2 0h.5c.3 0 .5-.2.5-.5v-2c0-.3-.2-.5-.5-.5h-.5c-.3 0-.5.2-.5.5V17c0 .3.2.5.5.5z"/>
        <path d="M13.5 17.5h5.3c1.77 0 3.2-1.43 3.2-3.2 0-1.52-1.06-2.8-2.5-3.12V11c0-2.2-1.8-4-4-4-.72 0-1.39.2-1.97.53-.02.15-.03.31-.03.47v10.15z"/>
      </svg>
    ),
  },
  {
    name: 'Vimeo',
    svg: (
      <svg viewBox="-3 -3 24 24" width="46" height="46" fill="currentColor">
        <path d="M15.992 4.204q-.106 2.334-3.262 6.393-3.263 4.243-5.522 4.243-1.4 0-2.367-2.583L3.55 7.523Q2.83 4.939 2.007 4.94q-.178.001-1.254.754L0 4.724a210 210 0 0 0 2.334-2.081q1.581-1.364 2.373-1.437 1.865-.185 2.298 2.553.466 2.952.646 3.666.54 2.447 1.186 2.445.5 0 1.508-1.587 1.006-1.587 1.077-2.415.144-1.37-1.077-1.37a3 3 0 0 0-1.185.261q1.183-3.86 4.508-3.756 2.466.075 2.324 3.2z"/>
      </svg>
    ),
  },
  {
    name: 'Linkedin',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M8 19H5V8h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3V8h3v1.765c1.396-2.586 7-2.777 7 2.476V19z"/>
      </svg>
    ),
  },
  {
    name: 'TikTok',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  {
    name: 'Facebook',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    name: 'Twitch',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M7.929 4.714h1.715v5.143H7.929zm4.286 0h1.714v5.143h-1.714zM2.57 0L.43 5.143v16.286h5.143V24l2.571-2.571h3.429L19.286 13.714V0zm15 12.429l-3.43 3.428h-3.428L7.714 18.857v-3H4.286V2.143h13.286z"/>
      </svg>
    ),
  },
  {
    name: 'Pinterest',
    svg: (
      <svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.239 2.636 7.86 6.356 9.314-.088-.792-.168-2.007.035-2.873.184-.782 1.183-4.98 1.183-4.98s-.301-.603-.301-1.495c0-1.399.811-2.444 1.822-2.444.859 0 1.274.645 1.274 1.418 0 .864-.55 2.156-.834 3.354-.238 1.005.504 1.824 1.495 1.824 1.794 0 3.173-1.892 3.173-4.624 0-2.418-1.737-4.11-4.217-4.11-2.874 0-4.562 2.155-4.562 4.383 0 .869.335 1.801.754 2.307a.304.304 0 01.07.291c-.076.319-.246 1.005-.28 1.145-.044.184-.146.223-.338.134-1.261-.587-2.049-2.431-2.049-3.914 0-3.186 2.314-6.109 6.67-6.109 3.501 0 6.224 2.496 6.224 5.832 0 3.48-2.194 6.28-5.239 6.28-1.023 0-1.985-.532-2.313-1.16l-.629 2.395c-.227.873-.842 1.968-1.255 2.636A10.002 10.002 0 0022 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
  },
  {
    name: 'Reddit',
    svg: (
      <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-2.752 4.433c-1.514 0-2.216-.67-2.233-.69a.25.25 0 0 1 .354-.354c.046.046.59.544 1.879.544 1.26 0 1.794-.469 1.838-.509a.25.25 0 1 1 .313.38c-.062.05-1.127.629-2.151.629z"/>
      </svg>
    ),
  }
];
import { useEffect, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import './PlatformsStrip.css';

function ellipseAngles(count: number, rx: number, ry: number): number[] {
  const N = 2000;
  const tValues: number[] = new Array(N + 1);
  const cumArcs: number[] = new Array(N + 1);
  cumArcs[0] = 0;
  tValues[0] = 0;

  for (let i = 1; i <= N; i++) {
    const t = (i * 2 * Math.PI) / N;
    tValues[i] = t;
    const dt = (2 * Math.PI) / N;
    const prevT = tValues[i - 1];
    const xd = -rx * Math.sin(prevT);
    const yd = ry * Math.cos(prevT);
    cumArcs[i] = cumArcs[i - 1] + Math.sqrt(xd * xd + yd * yd) * dt;
  }

  const totalArc = cumArcs[N];
  const step = totalArc / count;
  const result: number[] = [];
  let idx = 0;

  for (let i = 0; i < count; i++) {
    const target = i * step;
    while (idx < N - 1 && cumArcs[idx + 1] < target) idx++;
    const frac = (target - cumArcs[idx]) / (cumArcs[idx + 1] - cumArcs[idx]);
    const t = tValues[idx] + frac * (tValues[idx + 1] - tValues[idx]);
    result.push((t * 180) / Math.PI);
  }

  return result;
}

export default function PlatformsStrip() {
  const { t } = useLanguage();
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    const items = ring.querySelectorAll<HTMLDivElement>('.orbit-item');
    const lineCores = ring.querySelectorAll<SVGLineElement>('.orbit-line-core');
    const lineGlows = ring.querySelectorAll<SVGLineElement>('.orbit-line-glow');
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    let RX: number, RY: number;
    if (isMobile) {
      const idealRX = Math.round((window.innerWidth - 44) * 0.55 / 2);
      RX = Math.max(60, Math.min(180, idealRX));
      RY = 110;
    } else {
      RX = 240;
      RY = 110;
    }

    const isStadium = RX > RY;

    let setPositions: (offset: number) => void;
    let tick: (() => void) | undefined;

    if (isStadium) {
      const semiWidth = RX - RY;
      const topLen = 2 * semiWidth;
      const rightLen = Math.PI * RY;
      const botLen = 2 * semiWidth;
      const leftLen = Math.PI * RY;
      const totalLen = topLen + rightLen + botLen + leftLen;
      const spacing = totalLen / items.length;
      const baseArcs = Array.from({ length: items.length }, (_, i) => i * spacing);

      const arcToPos = (arc: number) => {
        const a = ((arc % totalLen) + totalLen) % totalLen;
        if (a < topLen) return { x: -semiWidth + (a / topLen) * 2 * semiWidth, y: -RY };
        if (a < topLen + rightLen) {
          const angle = -Math.PI / 2 + ((a - topLen) / rightLen) * Math.PI;
          return { x: semiWidth + RY * Math.cos(angle), y: RY * Math.sin(angle) };
        }
        if (a < topLen + rightLen + botLen) {
          const t = (a - topLen - rightLen) / botLen;
          return { x: semiWidth - t * 2 * semiWidth, y: RY };
        }
        const angle = Math.PI / 2 + ((a - topLen - rightLen - botLen) / leftLen) * Math.PI;
        return { x: -semiWidth + RY * Math.cos(angle), y: RY * Math.sin(angle) };
      };

      setPositions = (offset: number) => {
        items.forEach((item, i) => {
          const arc = baseArcs[i] + offset;
          const pos = arcToPos(arc);
          const depth = 1 + 0.1 * (pos.y / RY);
          item.style.transform = `translate(-50%,-50%) translate3d(${pos.x}px,${pos.y}px,0) scale(${depth})`;
          item.style.zIndex = `${20 + Math.round(10 * (pos.y / RY))}`;
          const sx = String(pos.x);
          const sy = String(pos.y);
          lineCores[i]?.setAttribute('x2', sx);
          lineCores[i]?.setAttribute('y2', sy);
          lineGlows[i]?.setAttribute('x2', sx);
          lineGlows[i]?.setAttribute('y2', sy);
        });
      };

      let progress = 0;
      const STEP_PX = 0.7;
      tick = () => {
        progress = (progress + STEP_PX) % totalLen;
        setPositions(progress);
      };
    } else {
      const angles = ellipseAngles(items.length, RX, RY);

      setPositions = (angle: number) => {
        items.forEach((item, i) => {
          const theta = angles[i];
          const a = ((angle + theta) * Math.PI) / 180;
          const x = RX * Math.cos(a);
          const y = RY * Math.sin(a);
          const depth = 1 + 0.1 * Math.sin(a);
          item.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,0) scale(${depth})`;
          item.style.zIndex = `${20 + Math.round(10 * Math.sin(a))}`;
          const sx = String(x);
          const sy = String(y);
          lineCores[i]?.setAttribute('x2', sx);
          lineCores[i]?.setAttribute('y2', sy);
          lineGlows[i]?.setAttribute('x2', sx);
          lineGlows[i]?.setAttribute('y2', sy);
        });
      };

      let angle = 0;
      const STEP = 0.17;
      tick = () => {
        angle = (angle + STEP) % 360;
        setPositions(angle);
      };
    }

    setPositions(0);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf: number;
    const loop = () => {
      if (!ring.dataset.paused && tick) tick();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const canHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const handleTrackOver = (e: React.MouseEvent) => {
    if (!canHover) return;
    const itemEl = (e.target as HTMLElement).closest('.orbit-item');
    const inItem = !!itemEl;
    const ring = ringRef.current;
    if (!ring) return;
    ring.classList.toggle('has-hover', inItem);
    ring.querySelectorAll('.orbit-line-glow, .orbit-line-core').forEach(l => l.classList.remove('dimmed'));
    if (inItem) {
      ring.dataset.paused = 'true';
      const index = Array.from(ring.querySelectorAll('.orbit-item')).indexOf(itemEl as HTMLDivElement);
      ring.querySelectorAll('.orbit-line-glow').forEach((l, i) => {
        if (i !== index) l.classList.add('dimmed');
      });
      ring.querySelectorAll('.orbit-line-core').forEach((l, i) => {
        if (i !== index) l.classList.add('dimmed');
      });
    } else {
      delete ring.dataset.paused;
    }
  };

  const handleTrackLeave = () => {
    const ring = ringRef.current;
    if (!ring) return;
    ring.classList.remove('has-hover');
    delete ring.dataset.paused;
    ring.querySelectorAll('.orbit-line-glow, .orbit-line-core').forEach(l => l.classList.remove('dimmed'));
  };

  return (
    <section style={{
      width: '100%',
      padding: '4rem clamp(0.75rem, 5vw, 3rem) 2rem',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        padding: '2.5rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
        overflow: 'hidden',
      }}>
        <p style={{
          fontFamily: '"Black Ops One", cursive',
          fontSize: '1.1rem',
          letterSpacing: '0.12em',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
        }}>
          {t.platformsTitle}
        </p>

        <p style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          {t.platformsSubtitle}
        </p>

        <div className="orbit-track" onMouseOver={handleTrackOver} onMouseLeave={handleTrackLeave}>
          <div className="orbit-ring" ref={ringRef}>
            {PLATFORMS.map((p, i) => {
              return (
                <div
                  key={p.name}
                  className="orbit-item"
                >
                  <div className="orbit-icon">{p.svg}</div>
                  <span>{p.name}</span>
                </div>
              );
            })}
            <svg className="orbit-svg" viewBox="-300 -200 600 400">
              {PLATFORMS.map((_, i) => (
                <g key={i}>
                  <line className="orbit-line-glow" x1={0} y1={0} x2={0} y2={0} />
                  <line className="orbit-line-core" x1={0} y1={0} x2={0} y2={0} />
                </g>
              ))}
              <circle cx={0} cy={0} r={12} fill="none" stroke="var(--text-secondary)" strokeWidth={1} strokeDasharray="2 3" opacity={0.35} />
              <circle cx={0} cy={0} r={14} fill="none" stroke="var(--text-secondary)" strokeWidth={1.5} className="orbit-center-pulse" />
              <circle cx={0} cy={0} r={7} fill="var(--accent)" />
              <g transform="translate(0, 1)">
                <path d="M-3.5,-2.5 L0,2.5 L3.5,-2.5" stroke="#fff" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <line x1={0} y1={-5.5} x2={0} y2={2.5} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
                <line x1={-5} y1={4} x2={5} y2={4} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}