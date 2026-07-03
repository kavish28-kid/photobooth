import { lazy, Suspense, useCallback, useMemo, useState, useRef, useEffect } from "react";
import CustomCursor from "./components/cursor/CustomCursor.jsx";
import SceneContainer from "./components/scene/SceneContainer.jsx";
import GlitchInterference from "./components/scene/GlitchInterference.jsx";
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
import { checkMidnight } from "./stores/themeStore.js";

const ParticleField = lazy(() => import("./three/ParticleField.jsx"));

export default function App(){
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [glitchTrigger, setGlitchTrigger] = useState(0);
  const prevActiveRef = useRef(active);
  const [midnight, setMidnight] = useState(false);

  useEffect(() => {
    setMidnight(checkMidnight());
    const id = setInterval(() => setMidnight(checkMidnight()), 60000);
    return () => clearInterval(id);
  }, []);

  const goTo = useCallback((index) => {
    const target = Math.max(0, Math.min(scenes.length - 1, index));
    if (target !== prevActiveRef.current) {
      prevActiveRef.current = target;
      setGlitchTrigger((n) => n + 1);
      setTimeout(() => setActive(target), 180);
    }
  }, []);

  const nudge = useCallback((dir) => goTo(active + dir), [active, goTo]);
  const api = useMemo(() => ({ active, goTo, nudge }), [active, goTo, nudge]);

  useWheelLock({ active, goTo, nudge, reduceMotion, count: scenes.length });

  return (
    <>
      <div className="noise" />
      <div className={`blob${midnight ? " midnight" : ""}`} />
      <div className={`blob${midnight ? " midnight" : ""}`} />
      <div className={`blob${midnight ? " midnight" : ""}`} />
      <div className="brand magnetic" onClick={() => goTo(0)}>FLARE<span>.</span></div>
      <div className="scene-count" aria-live="polite">{String(active + 1).padStart(2, "0")} / 0{scenes.length}</div>
      {!reduceMotion && active < 4 && <CustomCursor />}
      {!reduceMotion && <GlitchInterference trigger={glitchTrigger} />}
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
          <Darkroom index={5} goTo={goTo} />
          <MemoryReveal index={6} goTo={goTo} />
          <MemoryUniverse index={7} active={active === 7} goTo={goTo} />
        </SceneContainer>
      </main>
    </>
  );
}
