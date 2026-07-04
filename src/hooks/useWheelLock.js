import { useEffect, useRef } from "react";

export function useWheelLock({ active, goTo, nudge, reduceMotion, count }){
  const locked = useRef(false);
  const touchStart = useRef(0);
  const touchDelta = useRef(0);

  useEffect(() => {
    if(reduceMotion) return;
    const unlock = () => window.setTimeout(() => { locked.current = false; }, 900);
    const commit = (dir) => {
      if(locked.current) return;
      locked.current = true;
      try { nudge(dir); } catch (e) { console.warn("[FLARE] nudge error:", e); }
      unlock();
    };
    const onWheel = (event) => {
      event.preventDefault();
      if(Math.abs(event.deltaY) > 34) commit(event.deltaY > 0 ? 1 : -1);
    };
    const onKey = (event) => {
      if(["ArrowDown","PageDown"," "].includes(event.key)){ event.preventDefault(); commit(1); }
      if(["ArrowUp","PageUp"].includes(event.key)){ event.preventDefault(); commit(-1); }
      if(event.key === "Home"){ event.preventDefault(); goTo(0); }
      if(event.key === "End"){ event.preventDefault(); goTo(count - 1); }
    };
    const onTouchStart = (event) => {
      touchStart.current = event.touches[0].clientY;
      touchDelta.current = 0;
    };
    const onTouchMove = (event) => {
      touchDelta.current = event.touches[0].clientY - touchStart.current;
      document.documentElement.style.setProperty("--drag", `${touchDelta.current * 0.18}px`);
    };
    const onTouchEnd = () => {
      document.documentElement.style.setProperty("--drag", "0px");
      if(Math.abs(touchDelta.current) > 58) commit(touchDelta.current < 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive:false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive:true });
    window.addEventListener("touchmove", onTouchMove, { passive:true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [active, count, goTo, nudge, reduceMotion]);
}
