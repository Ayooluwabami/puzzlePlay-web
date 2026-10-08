import { useCallback, useEffect, useRef, useState } from 'react';

// Measures an element's content box so boards can fill exactly the space left
// after headers, pads and safe areas — no hard-coded viewport arithmetic.
// Returns a callback ref, so it also works for elements that mount later.
export function useElementSize<T extends HTMLElement>() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((el: T | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize(s => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(el);
    observer.current = ro;
  }, []);

  useEffect(() => () => observer.current?.disconnect(), []);

  return [ref, size] as const;
}
