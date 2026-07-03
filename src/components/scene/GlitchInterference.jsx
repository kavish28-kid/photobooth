import { useEffect, useState } from "react";

export default function GlitchInterference({ trigger }) {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    setPhase("static");

    const t1 = setTimeout(() => setPhase("scan"), 80);
    const t2 = setTimeout(() => setPhase("flash"), 200);
    const t3 = setTimeout(() => {
      setPhase("idle");
      setVisible(false);
    }, 420);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className={`glitch-overlay glitch-${phase}`} aria-hidden="true">
      <div className="glitch-noise" />
      <div className="glitch-scanlines" />
      <div className="glitch-bar glitch-bar-1" />
      <div className="glitch-bar glitch-bar-2" />
      <div className="glitch-bar glitch-bar-3" />
    </div>
  );
}
