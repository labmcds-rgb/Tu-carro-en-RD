import { useEffect, useRef, type ReactNode } from 'react';

export default function ChipRow({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    const row = rowRef.current;
    if (!el || !row) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth - 2;
      row.classList.toggle('more-left', el.scrollLeft > 4);
      row.classList.toggle('more-right', el.scrollLeft < max);
    };
    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [children]);

  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 170, behavior: 'smooth' });

  return (
    <div className="chiprow" ref={rowRef}>
      <div className="chips" ref={scrollRef}>
        {children}
      </div>
      <button className="chip-arrow left" onClick={() => scroll(-1)} aria-label="Anterior">
        ‹
      </button>
      <button className="chip-arrow right" onClick={() => scroll(1)} aria-label="Siguiente">
        ›
      </button>
    </div>
  );
}
