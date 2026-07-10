import { useEffect, useRef } from 'react';

const RADIUS = 150;
const STRENGTH = 0.35;

export default function AnimatedBackground() {
  const symbols = ['♩','♪','♫','♬','𝄞','▶','📽','⬇','♩','♪','♫','▶','📽','♬','𝄞','♩','♪','♫','♬','▶','📽','⬇','𝄞','♩','♪','♫','♬','▶','📽','♩','♪','♫','♬','𝄞','▶','📽','⬇','♩','♪','♫','♬','𝄞','▶','📽','⬇','♩','♪','♫','♬','𝄞','▶','📽','⬇','♩','♪','♫','▶','📽','♬','𝄞','♩','♪','♫','♬','▶','📽','⬇','𝄞','♩','♪','♫','𝄞','📽','⬇','♩','♪','♫','♬','𝄞','▶','📽','⬇'];

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', onMouseMove);

    const tick = () => {
      const { x, y } = mouseRef.current;
      const elms = containerRef.current?.querySelectorAll<HTMLElement>('.bg-symbol');
      if (elms) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const highColor = isDark ? 'rgba(240,240,240,0.18)' : 'rgba(10,10,10,0.22)';
        for (const el of elms) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = cx - x;
          const dy = cy - y;
          const dist2 = dx * dx + dy * dy;

          if (dist2 < RADIUS * RADIUS) {
            const dist = Math.sqrt(dist2);
            const force = 1 - dist / RADIUS;
            el.style.setProperty('--px', dx * force * STRENGTH + 'px');
            el.style.setProperty('--py', dy * force * STRENGTH + 'px');
            el.style.setProperty('--symbol-color', highColor);
          } else {
            el.style.setProperty('--px', '0px');
            el.style.setProperty('--py', '0px');
            el.style.removeProperty('--symbol-color');
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const items = symbols.map((sym, i) => ({
    symbol: sym,
    left: `${(i * 8.2 + 1.5) % 98}%`,
    size: `${0.8 + (i % 5) * 0.35}rem`,
    duration: `${10 + (i % 8) * 2}s`,
    delay: `${-(i * 1.3) % 18}s`,
    mobileHide: i >= 22,
  }));

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }} aria-hidden="true">
      {items.map((item, i) => (
        <span
          key={i}
          className={`bg-symbol${item.mobileHide ? ' hide-mobile' : ''}`}
          style={{
            left: item.left,
            top: '-10vh',
            fontSize: item.size,
            animationDuration: item.duration,
            animationDelay: item.delay,
          }}
        >
          {item.symbol}
        </span>
      ))}

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
