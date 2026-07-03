import { useState, useCallback, useEffect } from "react";
import Scene from "../components/scene/Scene.jsx";
import { useAudio } from "../hooks/useAudio.js";
import gsap from "gsap";

export default function EnterFlare({ index, api }) {
  const audio = useAudio();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [zooming, setZooming] = useState(false);
  const [awake, setAwake] = useState(false);
  const [blink, setBlink] = useState(false);
  const [smile, setSmile] = useState(false);

  useEffect(() => { const t = setTimeout(() => setAwake(true), 800); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!awake) return;
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 200);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, [awake]);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top, nx: x, ny: y });
    setSmile(Math.abs(x) < 0.3 && Math.abs(y) < 0.3);
  }, []);

  const handleClick = useCallback(() => {
    audio.lensClose();
    setZooming(true);
    setTimeout(() => audio.flashSound(), 300);
    setTimeout(() => api.goTo(2), 600);
  }, [api, audio]);

  return (
    <Scene index={index}>
      <div className={`enter-flare ${zooming ? "lens-zoom" : ""} ${awake ? "awake" : "sleeping"}`} onMouseMove={handleMouse} onClick={handleClick}>
        <div className="mouse-light" style={{ left: mouse.x, top: mouse.y }} />
        <div className="flare-particles">
          {awake && [...Array(24)].map((_, i) => (
            <span key={i} className="particle" style={{
              "--x": Math.random() * 100 + "%",
              "--y": Math.random() * 100 + "%",
              "--d": Math.random() * 4 + 2 + "s",
              "--s": Math.random() * 5 + 2 + "px",
              animationDelay: Math.random() * 4 + "s"
            }} />
          ))}
        </div>
        <div className={`flare-camera${blink ? " blinking" : ""}`} style={{ transform: `rotateY(${mouse.nx * 6}deg) rotateX(${-mouse.ny * 6}deg)` }}>
          <div className={`flare-lens${blink ? " lens-blink" : ""}`}>
            <div className="lens-aperture" />
          </div>
          <div className="camera-leds">
            <span className={`led ${smile ? "led-smile" : ""}`} />
            <span className={`led ${smile ? "led-smile" : ""}`} />
            <span className={`led ${smile ? "led-smile" : ""}`} />
            <span className={`led ${smile ? "led-smile" : ""}`} />
            <span className={`led ${smile ? "led-smile" : ""}`} />
          </div>
          <div className="glass-flare-1" />
          <div className="glass-flare-2" />
        </div>
        <h1 className="flare-title" style={{ opacity: awake ? 0.9 : 0, transition: "opacity 1.5s ease" }}>FLARE</h1>
        <p className="flare-sub" style={{ opacity: awake ? 0.5 : 0, transition: "opacity 2s ease 0.5s" }}>Create a Memory</p>
      </div>
    </Scene>
  );
}
