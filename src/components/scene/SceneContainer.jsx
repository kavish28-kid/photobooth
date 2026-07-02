export default function SceneContainer({ active, reduceMotion, children }){
  return (
    <div
      className="scene-container"
      style={reduceMotion ? undefined : { transform:`translate3d(0, calc(${-active * 100}vh + var(--drag, 0px)), 0)` }}
    >
      {children.map((child, index) => {
        const distance = Math.abs(index - active);
        const className = distance === 0 ? "active" : distance === 1 ? "near" : "";
        return <div className={`scene-shell ${className}`} key={index}>{child}</div>;
      })}
    </div>
  );
}
