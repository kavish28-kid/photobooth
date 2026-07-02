import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import TiltCard from "../components/ui/TiltCard.jsx";
import { filters, quotes } from "../data.js";

export default function Gallery({ index }){
  return (
    <Scene index={index}>
      <div className="eyebrow">Filter library</div>
      <Headline>Every roll of film <span className="pink">you wish</span> you still had.</Headline>
      <div className="gallery-wrap">
        <div className="gallery-grid">
          {filters.map(([name, meta, bg, z]) => (
            <TiltCard className="filter-tile" key={name} style={{ "--z":`${z}px` }}>
              <div className="swatch" style={{ background:bg }} />
              <div className="filter-label"><strong>{name}</strong><span>{meta}</span></div>
            </TiltCard>
          ))}
        </div>
      </div>
      <div className="caption-strip">
        {quotes.map(([quote, who]) => <div className="quote" key={who}>"{quote}"<span>- {who}</span></div>)}
      </div>
    </Scene>
  );
}
