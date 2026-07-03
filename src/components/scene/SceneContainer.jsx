export default function SceneContainer({ active, reduceMotion, children }){
  return (
    <div className="scene-container">
      {children.map((child, index) => {
        const distance = Math.abs(index - active);
        const isActive = index === active;
        const isNear = distance === 1;
        return (
          <div
            key={index}
            className={`scene-shell ${isActive ? "active" : isNear ? "near" : ""}`}
            aria-hidden={!isActive}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
