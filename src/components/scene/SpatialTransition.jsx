import { useEffect, useState } from "react";

const transitions = {
  0: { type: "lens", label: "lens-fade" },
  1: { type: "flash", label: "flash-zoom" },
  2: { type: "slide", label: "slide-right" },
  3: { type: "heart", label: "heart-pulse-trans" },
  4: { type: "strip", label: "strip-slide" },
  5: { type: "dissolve", label: "chemical-dissolve" },
  6: { type: "fly", label: "photo-fly" },
};

export default function SpatialTransition({ trigger, fromScene }) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (!trigger) return;
    const t = transitions[fromScene] || { type: "fade", label: "fade" };
    setVisible(true);
    setPhase(t.label);

    const d1 = t.type === "lens" ? 500 : t.type === "flash" ? 400 : t.type === "heart" ? 600 : 350;
    const d2 = t.type === "lens" ? 200 : t.type === "flash" ? 150 : t.type === "heart" ? 200 : 150;

    const t1 = setTimeout(() => setPhase(`${t.label}-peak`), d1);
    const t2 = setTimeout(() => {
      setPhase("idle");
      setVisible(false);
    }, d1 + d2);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [trigger, fromScene]);

  if (!visible) return null;

  return (
    <div className={`spatial-transition ${phase}`} aria-hidden="true">
      {phase.includes("lens") && <div className="trans-lens-ring" />}
      {phase.includes("flash") && <div className="trans-flash" />}
      {phase.includes("slide") && <div className="trans-slide-panel" />}
      {phase.includes("heart") && <div className="trans-heart" />}
      {phase.includes("strip") && <div className="trans-strip" />}
      {phase.includes("dissolve") && <div className="trans-dissolve" />}
      {phase.includes("fly") && <div className="trans-fly" />}
    </div>
  );
}
