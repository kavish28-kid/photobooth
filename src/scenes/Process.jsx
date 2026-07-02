import { useEffect, useState } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { processSteps } from "../data.js";

export default function Process({ index, active }){
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    if(!active) return;
    const id = setInterval(() => setSelected((value) => (value + 1) % processSteps.length), 2600);
    return () => clearInterval(id);
  }, [active]);
  const step = processSteps[selected];

  return (
    <Scene index={index}>
      <div className="step-room">
        <div>
          <div className="eyebrow">The process</div>
          <Headline>Four steps. <span className="aurora">Zero setup.</span></Headline>
          <p className="sub">One room at a time, the booth walks everyone from link to finished strip without asking them to learn a new app.</p>
        </div>
        <div className="step-room compact">
          <div className="step-list">
            {processSteps.map((item, itemIndex) => (
              <button className={`step-button ${selected === itemIndex ? "active" : ""}`} key={item[0]} onClick={() => setSelected(itemIndex)} type="button">
                <span>{item[0]}</span>{item[1]}
              </button>
            ))}
          </div>
          <article className="step-card" aria-live="polite">
            <div className="big-num">{step[0]}</div>
            <div><h3>{step[1]}</h3><p>{step[2]}</p></div>
          </article>
        </div>
      </div>
    </Scene>
  );
}
