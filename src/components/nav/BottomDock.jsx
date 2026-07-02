const paths = [
  "M12 3l8 6v10H4V9l8-6z",
  "M4 7h16M4 12h16M4 17h16",
  "M7 7h10v10H7zM4 4h16v16H4z",
  "M4 6h16v12H4zM8 10h8M8 14h5",
  "M6 5h12v14H6zM9 9h6M9 13h6",
  "M12 4v16M4 12h16"
];

export default function BottomDock({ scenes, active, goTo }){
  return (
    <nav className="bottom-dock" aria-label="Mobile scene navigation">
      {scenes.map((scene, index) => (
        <button
          aria-label={scene}
          className={`dock-btn ${active === index ? "active" : ""}`}
          key={scene}
          onClick={() => goTo(index)}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d={paths[index]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </nav>
  );
}
