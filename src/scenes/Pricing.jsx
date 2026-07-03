import { useState } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";
import { faqs, plans } from "../data.js";

export default function Pricing({ index }){
  const [open, setOpen] = useState(true);
  return (
    <Scene index={index}>
      <div className="pricing-layout">
        <div>
          <div className="eyebrow">Pricing ✦</div>
          <Headline>one good camera, <span className="grad-text">three ways</span> to use it ✦</Headline>
          <div className="pricing-grid">
            {plans.map(([tag, name, amount, cadence, items, cta, featured]) => (
              <article className={`price-card ${featured ? "featured" : ""}`} key={name}>
                <div className="tag">{tag}</div>
                <h3>{name}</h3>
                <div className="amount">{amount}<span>{cadence}</span></div>
                <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
                <MagneticButton className={featured ? "primary" : ""}>{cta}</MagneticButton>
              </article>
            ))}
          </div>
        </div>
        <aside className={`faq-drawer ${open ? "open" : ""}`}>
          <button className="faq-head" onClick={() => setOpen(!open)} type="button">Good questions <span>{open ? "-" : "+"}</span></button>
          <div className="faq-panel">
            {faqs.map(([question, answer]) => <div className="faq-item" key={question}><strong>{question}</strong><p>{answer}</p></div>)}
          </div>
        </aside>
      </div>
    </Scene>
  );
}
