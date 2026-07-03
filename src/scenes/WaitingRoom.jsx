import { useEffect, useState } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { getTheme } from "../stores/themeStore.js";

export default function WaitingRoom({ index, api }){
  const [state, setState] = useState("waiting");
  const [story] = useState(() => getTheme().story);
  const isActive = api.active === index;

  useEffect(() => {
    if (!isActive) return;
    setState("waiting"); // reset on activate
    const t1 = setTimeout(() => setState("typing"), 2000);
    const t2 = setTimeout(() => setState("connected"), 3500);
    const t3 = setTimeout(() => setState("ready"), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isActive]);

  useEffect(() => {
    if (isActive && state === "ready") api.goTo(4);
  }, [state, api, isActive]);

  const avatar = story?.icon || "👤";
  const gradient = story?.gradient || "linear-gradient(135deg,#FF2A75,#FF6F91)";

  return (
    <Scene index={index}>
      <div className="waiting-room" style={{ background: "var(--bg-dark,#0a0a0f)" }}>
        <div className="waiting-avatar" style={{ background: gradient }}>
          <span>{avatar}</span>
        </div>

        {state === "waiting" && (
          <div className="waiting-status">
            <Headline as="p">Waiting for your friend...</Headline>
          </div>
        )}

        {state === "typing" && (
          <div className="waiting-status">
            <Headline as="p">Friend is typing<span className="typing-dots">...</span></Headline>
          </div>
        )}

        {state === "connected" && (
          <div className="waiting-status">
            <Headline as="p">Connected <span className="heart-pulse">✦</span></Headline>
            <div className="floating-hearts">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="heart-particle" style={{ animationDelay: `${i * 0.3}s` }}>❤</span>
              ))}
            </div>
          </div>
        )}

        {state === "ready" && (
          <div className="waiting-ready">
            <Headline as="p">Ready <span>✦</span></Headline>
          </div>
        )}
      </div>
    </Scene>
  );
}
