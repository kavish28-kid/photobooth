import { useTextReveal } from "../../hooks/useTextReveal.js";

export default function Headline({ as:Tag = "h2", children, className = "" }){
  const content = useTextReveal(Array.isArray(children) ? children : [children]);
  return <Tag className={`split ${className}`}>{content}</Tag>;
}
