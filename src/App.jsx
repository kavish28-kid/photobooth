import { lazy, Suspense, useCallback, useMemo, useState, useRef, useEffect } from "react";
import CustomCursor from "./components/cursor/CustomCursor.jsx";
import SceneContainer from "./components/scene/SceneContainer.jsx";
import SpatialTransition from "./components/scene/SpatialTransition.jsx";
import ColdOpen from "./scenes/ColdOpen.jsx";
import EnterFlare from "./scenes/EnterFlare.jsx";
import ChooseStory from "./scenes/ChooseStory.jsx";
import WaitingRoom from "./scenes/WaitingRoom.jsx";
import Booth from "./scenes/Booth.jsx";
import Darkroom from "./scenes/Darkroom.jsx";
import MemoryReveal from "./scenes/MemoryReveal.jsx";
import MemoryUniverse from "./scenes/MemoryUniverse.jsx";
import { scenes } from "./data.js";
import useReducedMotion from "./hooks/useReducedMotion.js";
import { useWheelLock } from "./hooks/useWheelLock.js";
import { useSwipe } from "./hooks/useSwipe.js";
import { checkMidnight } from "./stores/themeStore.js";

const ParticleField = lazy(() => import("./three/ParticleField.jsx"));
const DEBUG = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("debug");

export default function App(){
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [transTrigger, setTransTrigger] = useState(0);
  const [fromScene, setFromScene] = useState(0);
  const [navState, setNavState] = useState("idle");
  const [midnight, setMidnight] = useState(false);

  const navigating = useRef(false);
  const activeRef = useRef(active);
  const failsafeRef = useRef(null);
  const navStartRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    setMidnight(checkMidnight());
    const id = setInterval(() => setMidnight(checkMidnight()), 60000);
    return () => clearInterval(id);
  }, []);

  const unlockNav = useCallback(() => {
    navigating.current = false;
    setNavState("idle");
    if (failsafeRef.current) { clearTimeout(failsafeRef.current); failsafeRef.current = null; }
  }, []);

  const goTo = useCallback((index) => {
    if (navigating.current) return;
    const target = Math.max(0, Math.min(scenes.length - 1, index));
    if (target === activeRef.current) return;

    navigating.current = true;
    setNavState("locked");
    navStartRef.current = performance.now();
    setFromScene(activeRef.current);
    activeRef.current = target;
    setTransTrigger((n) => n + 1);
    setActive(target);

    failsafeRef.current = setTimeout(unlockNav, 1200);
  }, [unlockNav]);

  const handleTransitionEnd = useCallback(() => {
    const elapsed = performance.now() - navStartRef.current;
    if (DEBUG) console.log(`[FLARE] Transition complete: ${fromScene} → ${active} (${Math.round(elapsed)}ms)`);
    unlockNav();
  }, [fromScene, active, unlockNav]);

  const nudge = useCallback((dir) => goTo(activeRef.current + dir), [goTo]);
  const api = useMemo(() => ({ active, goTo, nudge }), [active, goTo, nudge]);

  useWheelLock({ active, goTo, nudge, reduceMotion, count: scenes.length });
  useSwipe({ onLeft: () => nudge(1), onRight: () => nudge(-1), enabled: !reduceMotion });

  return (
    <>
      <div className="noise" />
      {!reduceMotion && <div className={`blob${midnight ? " midnight" : ""}`} />}
      {!reduceMotion && <div className={`blob${midnight ? " midnight" : ""}`} />}
      {!reduceMotion && <div className={`blob${midnight ? " midnight" : ""}`} />}
      {!reduceMotion && active > 0 && (
        <div className="brand magnetic" onClick={() => goTo(0)}>FLARE<span>.</span></div>
      )}
      {!reduceMotion && active > 0 && (
        <div className="scene-count" aria-live="polite">{String(active + 1).padStart(2, "0")} / 0{scenes.length}</div>
      )}
      {!reduceMotion && active < 4 && <CustomCursor />}
      {!reduceMotion && <SpatialTransition trigger={transTrigger} fromScene={fromScene} onComplete={handleTransitionEnd} />}
      <main id="app">
        <Suspense fallback={null}>
          {!reduceMotion && active <= 1 && <ParticleField />}
        </Suspense>
        <SceneContainer active={active} reduceMotion={reduceMotion}>
          <ColdOpen index={0} api={api} />
          <EnterFlare index={1} api={api} />
          <ChooseStory index={2} api={api} />
          <WaitingRoom index={3} api={api} />
          <Booth index={4} active={active === 4} goTo={goTo} />
          <Darkroom index={5} active={active === 5} goTo={goTo} />
          <MemoryReveal index={6} active={active === 6} goTo={goTo} />
          <MemoryUniverse index={7} active={active === 7} goTo={goTo} />
        </SceneContainer>
      </main>

      {DEBUG && (
        <div style={{position:"fixed",top:8,right:8,zIndex:99999,background:"rgba(0,0,0,.85)",color:"#0f0",font:"11px/1.4 monospace",padding:"8px 12px",borderRadius:8,pointerEvents:"none",whiteSpace:"pre",border:"1px solid rgba(255,255,255,.1)"}}>
          {`Scene: ${active + 1}/8 (${scenes[active]})
Target: ${navigating.current ? activeRef.current + 1 : "-"}
Nav:    ${navState}
Lock:   ${navigating.current}
From:   ${fromScene}
Elapsed: ${navStartRef.current ? Math.round(performance.now() - navStartRef.current) + "ms" : "-"}`}
        </div>
      )}
    </>
  );
}
