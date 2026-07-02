export default function SideNav({ scenes, active, goTo }){
  return (
    <nav className="side-nav" aria-label="Scene navigation">
      {scenes.map((scene, index) => (
        <button
          aria-label={`Go to ${scene}`}
          className={`side-dot ${active === index ? "active" : ""}`}
          key={scene}
          onClick={() => goTo(index)}
          type="button"
        />
      ))}
    </nav>
  );
}
