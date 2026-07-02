import { useMagnetic } from "../../hooks/useMagnetic.js";

export default function MagneticButton({ children, className = "", onClick, href }){
  const ref = useMagnetic();
  const props = { ref, className:`btn magnetic ${className}`, onClick };
  if(href) return <a {...props} href={href}>{children}</a>;
  return <button {...props} type="button">{children}</button>;
}
