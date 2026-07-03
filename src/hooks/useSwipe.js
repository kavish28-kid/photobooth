import { useEffect, useRef } from "react";

const SWIPE_THRESHOLD = 50;

export function useSwipe({ onLeft, onRight, onUp, onDown, enabled = true }) {
  const touchStart = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e) => {
      const t = e.changedTouches[0];
      touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    };

    const handleTouchEnd = (e) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const elapsed = Date.now() - touchStart.current.time;

      if (elapsed > 500) { touchStart.current = null; return; }

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) { touchStart.current = null; return; }

      if (absDx > absDy) {
        if (dx > 0) onRight?.();
        else onLeft?.();
      } else {
        if (dy > 0) onDown?.();
        else onUp?.();
      }
      touchStart.current = null;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [onLeft, onRight, onUp, onDown, enabled]);
}
