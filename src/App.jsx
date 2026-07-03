import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import CustomCursor from "./components/cursor/CustomCursor.jsx";
import SideNav from "./components/nav/SideNav.jsx";
import BottomDock from "./components/nav/BottomDock.jsx";
import SceneContainer from "./components/scene/SceneContainer.jsx";
import Hero from "./scenes/Hero.jsx";
import Process from "./scenes/Process.jsx";
import Booth from "./scenes/Booth.jsx";
import Gallery from "./scenes/Gallery.jsx";
import Pricing from "./scenes/Pricing.jsx";
import Close from "./scenes/Close.jsx";
import { scenes } from "./data.js";
import { useReducedMotion } from "./hooks/useReducedMotion.js";
import { useWheelLock } from "./hooks/useWheelLock.js";

const ParticleField = lazy(() => import("./three/ParticleField.jsx"));

export default function App(){
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("room") ? 2 : 0;
  });
  const goTo = useCallback((index) => {
    setActive(Math.max(0, Math.min(scenes.length - 1, index)));
  }, []);
  const nudge = useCallback((dir) => goTo(active + dir), [active, goTo]);
  const api = useMemo(() => ({ active, goTo, nudge }), [active, goTo, nudge]);

  useWheelLock({ active, goTo, nudge, reduceMotion, count: scenes.length });

  return (
    <>
      <div className="noise" />
      <div className="brand magnetic" onClick={() => goTo(0)}>FLARE<span>.</span></div>
      <div className="scene-count" aria-live="polite">{String(active + 1).padStart(2, "0")} / 06</div>
      {!reduceMotion && <CustomCursor />}
      {!reduceMotion && <SideNav scenes={scenes} active={active} goTo={goTo} />}
      {!reduceMotion && <BottomDock scenes={scenes} active={active} goTo={goTo} />}
      <main id="app">
        <Suspense fallback={null}>
          {!reduceMotion && active <= 1 && <ParticleField />}
        </Suspense>
        <SceneContainer active={active} reduceMotion={reduceMotion}>
          <Hero index={0} api={api} />
          <Process index={1} active={active === 1} />
          <Booth index={2} active={active === 2} />
          <Gallery index={3} />
          <Pricing index={4} />
          <Close index={5} goTo={goTo} />
        </SceneContainer>
      </main>
    </>
  );
}
