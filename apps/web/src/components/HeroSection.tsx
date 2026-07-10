import { useEffect, useRef } from 'react';
import HeroDecoration from './HeroDecoration';
import TypewriterWord from './TypewriterWord';
import DownloadFlow from './DownloadFlow';
import { useLanguage } from '../hooks/useLanguage';

export default function HeroSection() {
  const { t } = useLanguage();
  const h1Ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = h1Ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;
      el.style.setProperty('--cx', String(Math.max(0, Math.min(1, cx))));
      el.style.setProperty('--cy', String(Math.max(0, Math.min(1, cy))));
    };

    const onLeave = () => {
      el.style.removeProperty('--cx');
      el.style.removeProperty('--cy');
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      style={{
        position: 'relative',
        zIndex: 1,
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        padding: 'clamp(1.5rem, 5vw, 4rem) clamp(0.75rem, 6vw, 5rem)',
      }}
    >
      <div className="hero-inner" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>

        <div className="hero-text-content" style={{ flex: '1 1 480px', maxWidth: '700px' }}>

          <h1 ref={h1Ref} className="hero-title" style={{ marginBottom: '1.5rem', overflowWrap: 'normal', wordBreak: 'keep-all' }}>
            {t.heroStaticTitle}<br />
            <TypewriterWord />
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '3px',
                height: '0.82em',
                marginLeft: '4px',
                backgroundColor: 'currentColor',
                verticalAlign: 'middle',
                position: 'relative',
                top: '-0.05em',
                animation: 'lf-blink 1s step-end infinite',
              }}
            />
          </h1>

          <div className="subtitle-tag" style={{ marginBottom: '2.5rem' }}>
            {t.heroSubtitle}
          </div>

          <DownloadFlow />
        </div>

        <div style={{ flexShrink: 0 }} className="hero-deco-wrapper">
          <HeroDecoration />
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .hero-deco-wrapper { display: none; }
        }
        @media (max-width: 640px) {
          .hero-inner { gap: 0.75rem !important; }
        }
        @media (max-width: 360px) {
          .hero-inner { gap: 0.5rem !important; }
          .hero-title { margin-bottom: 0.75rem !important; }
          .subtitle-tag { margin-bottom: 1.25rem !important; }
        }
      `}</style>
    </section>
  );
}
