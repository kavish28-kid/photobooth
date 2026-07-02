export default function Scene({ children, index }){
  return (
    <section className="scene" style={{ "--scene-index": index }}>
      <div className="scene-inner">{children}</div>
    </section>
  );
}
