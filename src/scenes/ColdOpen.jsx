import { useEffect, useState } from "react";
import Scene from "../components/scene/Scene.jsx";

export default function ColdOpen({ index, api }) {
  const [phase, setPhase] = useState("black");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("typing"), 1500);
    const t2 = setTimeout(() => setPhase("fade"), 5000);
    const t3 = setTimeout(() => setPhase("lens"), 5300);
    const t4 = setTimeout(() => setPhase("done"), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  useEffect(() => {
    if (phase === "done") api.goTo(1);
  }, [phase, api]);

  return (
    <Scene index={index}>
      <div className={`cold-open ${phase === "lens" || phase === "done" ? "lens-appear" : ""}`}>
        <p className="cold-text" data-visible={phase === "typing" || phase === "fade" || phase === "lens"}>
          {"some memories deserve more than screenshots.".split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 30}ms` }}>{ch === " " ? "\u00A0" : ch}</span>
          ))}
        </p>
        <div className="lens-overlay" />
      </div>
    </Scene>
  );
}
