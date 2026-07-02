import { useTiltCard } from "../../hooks/useTiltCard.js";

export default function TiltCard({ children, className = "", style }){
  const ref = useTiltCard();
  return <article ref={ref} className={`tilt-card ${className}`} style={style}>{children}</article>;
}
