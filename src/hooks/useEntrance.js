import { useEffect, useRef } from "react";
import gsap from "gsap";

const defaultConfig = {
  from: { opacity: 0, y: 30, scale: 0.96 },
  to: { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
  stagger: 0.08,
};

export function useEntrance(refs, config = {}) {
  const { from, to, stagger } = { ...defaultConfig, ...config };
  const timeline = useRef(null);

  useEffect(() => {
    const elements = Array.isArray(refs) ? refs : (refs?.current ? [refs.current] : []);
    if (!elements.length || !elements[0]) return;

    timeline.current = gsap.timeline({ paused: true });

    if (stagger && elements.length > 1) {
      timeline.current.fromTo(elements, from, { ...to, stagger, duration: to.duration || 0.6 });
    } else {
      elements.forEach((el) => {
        timeline.current.fromTo(el, from, to);
      });
    }

    timeline.current.play();

    return () => {
      if (timeline.current) timeline.current.kill();
    };
  }, [refs]);

  return timeline;
}
