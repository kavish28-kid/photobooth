import { useEffect, useRef } from "react";

export default function CustomCursor(){
  const dot = useRef(null);
  const ring = useRef(null);

  useEffect(() => {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, frame = 0;
    const move = (event) => {
      mx = event.clientX; my = event.clientY;
      dot.current.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.current.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
      frame = requestAnimationFrame(loop);
    };
    const enter = () => ring.current?.classList.add("active");
    const leave = () => ring.current?.classList.remove("active");
    window.addEventListener("mousemove", move);
    document.querySelectorAll("a,button,.magnetic").forEach((el) => {
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", leave);
    });
    loop();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      document.querySelectorAll("a,button,.magnetic").forEach((el) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return <><div ref={dot} className="cursor-dot" /><div ref={ring} className="cursor-ring" /></>;
}
