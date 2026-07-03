import { useState, useEffect } from "react";
import Scene from "../components/scene/Scene.jsx";
import { getAppState } from "../stores/appStore.js";
import MemoryGalaxy from "../three/MemoryGalaxy.jsx";

export default function MemoryUniverse({ index, active, goTo }) {
  const [memories, setMemories] = useState([]);
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const state = getAppState();
    setMemories(state.memories);
    setCount(state.totalMemories);
  }, []);

  const handleSelect = (idx) => {
    if (memories[idx]) setSelected(memories[idx]);
  };

  return (
    <Scene index={index}>
      <div className="memory-universe">
        <div className="galaxy-bg">
          <MemoryGalaxy count={count} memories={memories} onSelect={handleSelect} />
        </div>
        <div className="universe-stats">✦ {count} Memories in the Universe</div>
        <div className="universe-actions">
          <button className="btn btn-primary" onClick={() => goTo(4)}>Create Another Memory</button>
          <button className="btn btn-outline" onClick={() => goTo(0)}>Home</button>
        </div>
        <p className="universe-footer">your universe keeps growing</p>

        {selected && (
          <div className="memory-lightbox" onClick={() => setSelected(null)}>
            <div className="memory-lightbox-content" onClick={(e) => e.stopPropagation()}>
              <img src={selected.src} alt="Memory" />
              <button className="memory-lightbox-close" onClick={() => setSelected(null)}>✕</button>
            </div>
          </div>
        )}
      </div>
    </Scene>
  );
}
