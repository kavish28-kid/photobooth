import { useState, useCallback } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { stories } from "../data.js";
import { setStory } from "../stores/themeStore.js";

export default function ChooseStory({ index, api }){
  const [chosen, setChosen] = useState(null);

  const pick = useCallback((story) => {
    if (chosen) return;
    setChosen(story.id);
    setStory(story);
    setTimeout(() => api.goTo(3), 500);
  }, [chosen, api]);

  return (
    <Scene index={index}>
      <div className="choose-story" style={chosen ? { "--story-gradient": stories.find(s => s.id === chosen)?.gradient } : {}}>
        <Headline as="h2">Who are you making memories with?</Headline>
        <div className="story-grid">
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
