import { useState, useCallback } from "react";
import Scene from "../components/scene/Scene.jsx";

export default function EnterFlare({ index, api }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [zooming, setZooming] = useState(false);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const handleClick = useCallback(() => {
    setZooming(true);
    setTimeout(() => api.goTo(2), 600);
  }, [api]);

  return (
    <Scene index={index}>
      <div className={`enter-flare ${zooming ? "lens-zoom" : ""}`} onMouseMove={handleMouse} onClick={handleClick}>
        <div className="mouse-light" style={{ left: mouse.x, top: mouse.y }} />
        <div className="flare-particles">
          {[...Array(20)].map((_, i) => (
            <span key={i} className="particle" style={{
              "--x": Math.random() * 100 + "%",
              "--y": Math.random() * 100 + "%",
              "--d": Math.random() * 4 + 2 + "s",
              "--s": Math.random() * 6 + 3 + "px",
              animationDelay: Math.random() * 3 + "s"
            }} />
          ))}
        </div>
        <div className="flare-camera">
          <div className="flare-lens" />
          <div className="glass-flare-1" />
          <div className="glass-flare-2" />
        </div>
        <h1 className="flare-title">FLARE</h1>
        <p className="flare-sub">Enter</p>
      </div>
    </Scene>
  );
}
