import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { applyLanguage } from '../i18n/applyLanguage';
import type { Lang } from '../i18n/translations';

export default function LanguageToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { lang } = useLanguage();

  function toggle() {
    const next: Lang = lang === 'es' ? 'en' : 'es';
    applyLanguage(next);
  }

  if (!mounted) return null;

  return (
    <>
      <button
        className="toggle-btn"
        onClick={toggle}
        title={lang === 'es' ? 'Cambiar idioma a Inglés' : 'Switch to Spanish'}
        aria-label={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        style={{
          width: '44px',
          height: '44px',
          border: '1.5px solid var(--border-strong)',
          background: 'transparent',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: '"Space Mono", monospace',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}
      >
        {lang === 'es' ? 'ES' : 'EN'}
      </button>

      <style>{`
        .toggle-btn {
          transition: transform 0.2s ease, background 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        @media (hover: hover) {
          .toggle-btn:hover {
            transform: scale(1.08);
            background: var(--bg-card);
            border-color: var(--text-muted);
            box-shadow: 0 0 10px var(--overlay-bg);
          }
        }
      `}</style>
    </>
  );
}
