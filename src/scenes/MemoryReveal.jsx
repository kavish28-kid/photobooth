import { useState, useEffect, useRef } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { getState } from "../stores/photoStore.js";
import { addMemory } from "../stores/appStore.js";

export default function MemoryReveal({ index, goTo }) {
  const [photo, setPhoto] = useState(null);
  const [showFrame, setShowFrame] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);

  useEffect(() => {
    const state = getState();
    const dataUrl = state.selectedPhotos?.[0];
    if (dataUrl) {
      setPhoto(dataUrl);
      addMemory(dataUrl);
    }
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setShowFrame(true), 1000);
    const t2 = setTimeout(() => setShowTitle(true), 2500);
    const t3 = setTimeout(() => setShowActions(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setDragging(true);
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseUp = () => setDragging(false);

  const handleSave = () => {
    if (!photo) return;
    const link = document.createElement("a");
    link.download = "flare-memory.png";
    link.href = photo;
    link.click();
  };

  return (
    <Scene index={index}>
      <div
        className={`memory-reveal${dragging ? " dragging" : ""}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={wrapRef}
          className="reveal-photo-wrap"
          style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        >
          <div
            className={`reveal-photo${showFrame ? " reveal-frame" : ""}`}
            onMouseDown={handleMouseDown}
          >
            {photo && <img src={photo} alt="Framed memory" />}
          </div>
        </div>
        {showTitle && (
          <Headline>
            <span className="reveal-title">Memory Unlocked ✦</span>
          </Headline>
        )}
        {showActions && (
          <div className="reveal-actions">
            <button className="btn btn-primary magnetic" onClick={() => goTo(7)}>Continue</button>
            <button className="btn btn-outline magnetic" onClick={handleSave}>Save</button>
          </div>
        )}
      </div>
    </Scene>
  );
}
