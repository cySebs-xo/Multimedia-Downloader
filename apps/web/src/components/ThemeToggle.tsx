import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { theme } = useTheme();
  const { t } = useLanguage();

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('linkfetch-theme', next);
  }

  if (!mounted) return null;

  return (
    <button
      data-theme-toggle
      onClick={toggle}
      title={theme === 'dark' ? t.themeLightTooltip : t.themeDarkTooltip}
      aria-label={theme === 'dark' ? t.themeLightTooltip : t.themeDarkTooltip}
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
        transition: 'background 0.2s, color 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {theme === 'light' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  );
}
