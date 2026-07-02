import { useEffect, useState } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";

const featureList = [
  "Synced countdown across every guest's screen",
  "Studio-grade auto light balancing, even on laptop webcams",
  "Before/after preview so no one's surprised by the shot",
  "Instant film-strip export, ready to print or send"
];

export default function Booth({ index, active }){
  const [count, setCount] = useState(3);
  const [state, setState] = useState("POWERING ON");
  const [flash, setFlash] = useState(false);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    if(!active) return;
    let timers = [];
    const wait = (fn, ms) => timers.push(setTimeout(fn, ms));
    const loop = () => {
      setPrinted(false); setState("COUNTDOWN"); setCount(3);
      wait(() => setCount(2), 820);
      wait(() => setCount(1), 1640);
      wait(() => {
        setState("FLASH"); setCount(null); setFlash(true);
        wait(() => setFlash(false), 130);
      }, 2460);
      wait(() => { setState("DEVELOPING"); setPrinted(true); }, 3050);
      wait(() => setState("PRINTED"), 3850);
      wait(loop, 5200);
    };
    setState("POWERING ON");
    wait(() => setState("FOCUSING"), 450);
    wait(loop, 1000);
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <Scene index={index}>
      <div className="booth-machine">
        <div className="booth-copy">
          <div className="eyebrow">The booth</div>
          <Headline>A real countdown, a <span className="coral">real flash.</span></Headline>
          <p className="sub">FLARE is built like an actual booth - a warm-up frame, a three-count, a genuine flash moment, and a print animation that peels out like film.</p>
          <ul>{featureList.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
        <div className={`booth-screen ${flash ? "flash-now" : ""}`}>
          <div className="hud"><span><span className="rec" />LIVE</span><span>00:0{count ?? 0}</span></div>
          <div className="countdown">{count}</div>
          <div className={`print-slot ${printed ? "show" : ""}`}><div className="strip" /><div className="print-cap">FLARE PHOTOBOOTH - PRINT 01</div></div>
          <div className="status-chip"><span>{state}</span><span>ROLL 03 / 24 EXP</span></div>
        </div>
      </div>
    </Scene>
  );
}
