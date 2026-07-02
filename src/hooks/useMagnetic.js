import { useEffect, useRef } from "react";

export function useMagnetic(){
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if(!el || !window.matchMedia("(hover:hover)").matches) return;
    let frame = 0;
    const move = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (event.clientX - r.left - r.width / 2) * 0.24;
        const y = (event.clientY - r.top - r.height / 2) * 0.36;
        el.style.transform = `translate3d(${x}px,${y}px,0)`;
      });
    };
    const leave = () => { el.style.transform = "translate3d(0,0,0)"; };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, []);
  return ref;
}
