import { useState, useCallback, useEffect, useRef } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { stories } from "../data.js";
import { setStory } from "../stores/themeStore.js";
import gsap from "gsap";
import { useAudio } from "../hooks/useAudio.js";

export default function ChooseStory({ index, api }){
  const audio = useAudio();
  const gridRef = useRef(null);
  const [chosen, setChosen] = useState(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll(".story-card");
    gsap.fromTo(cards, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "power3.out" });
  }, []);

  const pick = useCallback((story) => {
    if (chosen) return;
    audio.lensClose();
    setChosen(story.id);
    setStory(story);
    setTimeout(() => audio.flashSound(), 400);
    setTimeout(() => api.goTo(3), 500);
  }, [chosen, api, audio]);

  return (
    <Scene index={index}>
      <div className="choose-story" style={chosen ? { "--story-gradient": stories.find(s => s.id === chosen)?.gradient } : {}}>
        <Headline as="h2">Who are you making memories with?</Headline>
        <div ref={gridRef} className="story-grid">
          {stories.map((s) => (
            <button key={s.id} className={`story-card${chosen === s.id ? " story-chosen" : ""}`} onClick={() => pick(s)}>
              <span className="story-icon">{s.icon}</span>
              <span className="story-label">{s.label}</span>
              <span className="story-tag">{s.tag}</span>
            </button>
          ))}
        </div>
      </div>
    </Scene>
  );
}
