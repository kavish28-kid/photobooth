import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";

export default function Hero({ index, api }){
  return (
    <Scene index={index}>
      <div className="two-col">
        <div>
          <div className="eyebrow">Online photobooth ✦ est. anywhere with a link</div>
          <Headline as="h1">{"say cheese • from wherever "}<span className="grad-text">you</span>{" are ✦"}</Headline>
          <p className="sub">FLARE turns any screen into a real photobooth — countdown, flash, filters, instant prints — so the whole group can pile in from across the room or across the world.</p>
          <div className="actions">
            <MagneticButton className="primary" onClick={() => api.goTo(4)}>✨ Open a booth <Arrow /></MagneticButton>
            <MagneticButton onClick={() => api.goTo(2)}>▶ See it in action <Play /></MagneticButton>
          </div>
        </div>
        <div className="hero-stage" aria-hidden="true">
          <div className="camera-body" />
          <Print id="FLR-001" meta="f/2.0" />
          <Print id="FLR-002" meta="ISO 200" alt />
        </div>
      </div>
    </Scene>
  );
}

function Print({ id, meta, alt }){
  return (
    <div className="float-print">
      <div className="shot" data-alt={alt || undefined} />
      <div className="cap"><span>{id}</span><span>{meta}</span></div>
    </div>
  );
}

function Arrow(){
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Play(){
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}
