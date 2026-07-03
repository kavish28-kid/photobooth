import { useState, useEffect } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { getAppState } from "../stores/appStore.js";
import MemoryGalaxy from "../three/MemoryGalaxy.jsx";

export default function MemoryUniverse({ index, active, goTo }){
  const [memories, setMemories] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const state = getAppState();
    setMemories(state.memories);
    setCount(state.totalMemories);
  }, []);

  return (
    <Scene index={index}>
      <div className="memory-universe">
        <div className="galaxy-bg">
          <MemoryGalaxy count={count} memories={memories} />
        </div>
        <div className="universe-stats">✦ {count} Memories in the Universe</div>
        <div className="universe-actions">
          <button className="btn btn-primary" onClick={() => goTo(4)}>New Session</button>
          <button className="btn btn-outline" onClick={() => goTo(0)}>Home</button>
        </div>
        <p className="universe-footer">your universe keeps growing</p>
      </div>
    </Scene>
  );
}
