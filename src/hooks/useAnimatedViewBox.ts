import { useEffect, useRef, useState } from 'react';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Anima suavemente o viewBox do SVG ate o alvo (zoom/pan). Respeita prefers-reduced-motion. */
export function useAnimatedViewBox(target: Box, duration = 700): Box {
  const [box, setBox] = useState<Box>(target);
  const current = useRef<Box>(target);
  const raf = useRef(0);

  useEffect(() => {
    const from = current.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      current.current = target;
      setBox(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const k = easeInOutCubic(t);
      const next: Box = {
        x: from.x + (target.x - from.x) * k,
        y: from.y + (target.y - from.y) * k,
        w: from.w + (target.w - from.w) * k,
        h: from.h + (target.h - from.h) * k,
      };
      current.current = next;
      setBox(next);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.x, target.y, target.w, target.h, duration]);

  return box;
}