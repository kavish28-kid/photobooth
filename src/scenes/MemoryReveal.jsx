import { useState, useEffect, useRef } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { getState } from "../stores/photoStore.js";
import { addMemory } from "../stores/appStore.js";
import { getTheme } from "../stores/themeStore.js";

const chapterLines = [
  "We laughed before the countdown.",
  "Someone blinked. We kept it anyway.",
  "Perfect lighting. Better company.",
  "Three frames. One moment.",
  "This one's going on the wall.",
  "Caught in the act of being happy.",
];

export default function MemoryReveal({ index, goTo }) {
  const [photo, setPhoto] = useState(null);
  const [showFrame, setShowFrame] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef(null);
  const theme = getTheme();
  const isCouple = theme.story?.id === "couple";
  const chapterLine = chapterLines[Math.floor(Math.random() * chapterLines.length)];
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

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
            <span className="reveal-title">{isCouple ? "Chapter One ✦" : "Memory Unlocked ✦"}</span>
            {isCouple && <span className="chapter-date">{today}</span>}
            {isCouple && <span className="chapter-line">"{chapterLine}"</span>}
          </Headline>
        )}
        {showActions && (
          <div className="reveal-actions">
            <button className="btn btn-primary magnetic" onClick={() => goTo(7)}>View in Universe</button>
            <button className="btn btn-outline magnetic" onClick={handleSave}>Keep this Forever</button>
          </div>
        )}
      </div>
    </Scene>
  );
}
