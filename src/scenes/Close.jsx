import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import MagneticButton from "../components/ui/MagneticButton.jsx";

export default function Close({ index, goTo }){
  return (
    <Scene index={index}>
      <div className="close-scene">
        <div className="eyebrow">Ready when you are</div>
        <Headline>Open a booth. <span className="aurora">See who shows up.</span></Headline>
        <div className="actions center">
          <MagneticButton className="primary" onClick={() => goTo(4)}>Start a session <Arrow /></MagneticButton>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => goTo(1)}>How it works</button>
          <button type="button" onClick={() => goTo(3)}>Filters</button>
          <button type="button" onClick={() => goTo(4)}>Pricing</button>
          <button type="button" onClick={() => goTo(4)}>FAQ</button>
        </div>
        <div className="copyright">FLARE PHOTOBOOTH - ROLL YOUR OWN LIGHT - 2026</div>
      </div>
    </Scene>
  );
}

function Arrow(){
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
