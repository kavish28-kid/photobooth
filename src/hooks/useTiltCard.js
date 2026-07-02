import { useEffect, useRef } from "react";

export function useTiltCard(){
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if(!el || !window.matchMedia("(hover:hover)").matches) return;
    let frame = 0;
    const move = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((event.clientX - r.left) / r.width - 0.5) * 9;
        const y = ((event.clientY - r.top) / r.height - 0.5) * -7;
        el.style.setProperty("--tilt", `rotateX(${y}deg) rotateY(${x}deg)`);
      });
    };
    const leave = () => el.style.setProperty("--tilt", "rotateX(0deg) rotateY(0deg)");
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
