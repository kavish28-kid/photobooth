import { useState, useEffect, useRef } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { frameStyles, photoFilters } from "../data.js";
import { getState, setFrameStyle, setFilterType, setSelectedPhotos } from "../stores/photoStore.js";
import { getTheme } from "../stores/themeStore.js";
import gsap from "gsap";

export default function Darkroom({ index, active, goTo }) {
  const [store, setStore] = useState(getState());
  const [activeFrame, setActiveFrame] = useState("strip");
  const [activeFilter, setActiveFilter] = useState("normal");
  const [developing, setDeveloping] = useState(false);
  const canvasRef = useRef(null);
  const panelRef = useRef(null);
  const theme = getTheme();
  const storyColor = theme.story?.color || "#FF2A75";

  useEffect(() => {
    if (!active) return;
    const s = getState();
    setStore(s);
    setDeveloping(true);
    const timer = setTimeout(() => setDeveloping(false), 3000);
    return () => { clearTimeout(timer); setDeveloping(false); };
  }, [active]);

  useEffect(() => {
    if (developing || !panelRef.current) return;
    gsap.fromTo(panelRef.current.querySelectorAll(".darkroom-section"), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" });
  }, [developing]);

  useEffect(() => {
    if (store.selectedPhotos.length > 0) renderPreview();
  }, [activeFrame, activeFilter, store.selectedPhotos]);

  const renderPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || store.selectedPhotos.length === 0) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 500;
    ctx.clearRect(0, 0, 400, 500);
    const imgs = [];
    let loaded = 0;
    store.selectedPhotos.forEach((src, i) => {
      const img = new Image();
      img.onload = () => {
        imgs[i] = img;
        loaded++;
        if (loaded === store.selectedPhotos.length) {
          drawFrame(ctx, 400, 500, imgs, activeFrame, activeFilter);
        }
      };
      img.src = src;
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `flare-darkroom-${store?.roomId || "solo"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const win = window.open("");
    win.document.write(
      `<img src="${canvas.toDataURL("image/png")}" onload="window.print();window.close()" />`
    );
  };

  const handleReveal = () => {
    setFrameStyle(activeFrame);
    setFilterType(activeFilter);
    const photos = store.selectedPhotos;
    setSelectedPhotos(photos);
    if (goTo) goTo(6);
  };

  return (
    <Scene index={index}>
      <div className={`darkroom${developing ? " developing" : ""}`}>
        <div className="darkroom-lighting" />
        {developing && <div className="chemical-develop" />}
        <div className="film-hanging">
          <div className="film-strip left" />
          <div className="film-strip right" />
        </div>
        <Headline><span className="grad-text">Darkroom ✦</span></Headline>
        <p className="sub">Frame, filter, and develop your final print.</p>
        <div className="darkroom-panels">
          <div className="darkroom-preview">
            <canvas ref={canvasRef} className="darkroom-canvas" />
            {store.selectedPhotos.length === 0 && (
              <div className="frame-empty-msg">No photos selected</div>
            )}
          </div>
          <div className="darkroom-controls" ref={panelRef} style={{"--story-accent": storyColor}}>
            <div className="darkroom-section">
              <h3 className="darkroom-label">Frame</h3>
              <div className="frame-chip-group">
                {frameStyles.map(([id, , , emoji]) => (
                  <button
                    key={id}
                    className={`frame-chip ${activeFrame === id ? "chip-active" : ""}`}
                    onClick={() => setActiveFrame(id)}
                  >{emoji}</button>
                ))}
              </div>
            </div>
            <div className="darkroom-section">
              <h3 className="darkroom-label">Filter</h3>
              <div className="filter-chip-group">
                {photoFilters.map(([id, name]) => (
                  <button
                    key={id}
                    className={`filter-chip ${activeFilter === id ? "chip-active" : ""}`}
                    onClick={() => setActiveFilter(id)}
                  >{name}</button>
                ))}
              </div>
            </div>
            <div className="darkroom-section">
              <h3 className="darkroom-label">Export</h3>
              <div className="export-buttons">
                <button className="btn btn-primary magnetic" onClick={handleDownload} disabled={store.selectedPhotos.length === 0}>Keep this Forever 💾</button>
                <button className="btn btn-outline magnetic" onClick={handlePrint} disabled={store.selectedPhotos.length === 0}>Print 🖨️</button>
              </div>
            </div>
            <div className="darkroom-section">
              <button className="btn btn-primary magnetic" onClick={handleReveal} disabled={store.selectedPhotos.length === 0}>Reveal Memory →</button>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

function drawFrame(ctx, w, h, imgs, frame, filter) {
  ctx.fillStyle = "#0c0b0e";
  ctx.fillRect(0, 0, w, h);
  if (frame === "strip") {
    const photoW = w - 40;
    const photoH = (h - 80) / 3;
    imgs.forEach((img, i) => {
      const y = 20 + i * (photoH + 20);
      ctx.fillStyle = "#111827";
      ctx.fillRect(15, y - 2, photoW + 10, photoH + 4);
      ctx.drawImage(img, 20, y, photoW, photoH);
    });
  } else if (frame === "grid") {
    const cols = 2, rows = 2, gap = 10;
    const cellW = (w - 30 - gap) / cols;
    const cellH = (h - 30 - gap) / rows;
    imgs.slice(0, 4).forEach((img, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = 15 + col * (cellW + gap), y = 15 + row * (cellH + gap);
      ctx.fillStyle = "white";
      ctx.fillRect(x - 4, y - 4, cellW + 8, cellH + 8);
      ctx.drawImage(img, x, y, cellW, cellH);
    });
  } else if (frame === "polaroid") {
    const img = imgs[0];
    if (!img) return;
    const border = 25, pw = w - border * 2, ph = h - border * 2 - 30;
    ctx.fillStyle = "white";
    ctx.fillRect(border - 4, border - 4, pw + 8, ph + 38);
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(border, border, pw, ph);
    ctx.drawImage(img, border, border, pw, ph);
    ctx.fillStyle = "#333";
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillText("✦ FLARE", border + 20, h - border + 8);
  } else if (frame === "classic") {
    const margin = 15, pw = w - margin * 2, ph = (h - margin * 3) / imgs.length;
    imgs.forEach((img, i) => {
      const y = margin + i * (ph + margin);
      ctx.drawImage(img, margin, y, pw, ph);
    });
  }
  applyFilter(ctx, w, h, filter);
}

function applyFilter(ctx, w, h, filter) {
  if (filter === "normal") return;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  if (filter === "warm") {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 25);
      data[i + 1] = Math.min(255, data[i + 1] + 8);
    }
  } else if (filter === "noir") {
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = data[i + 1] = data[i + 2] = Math.min(255, gray * 1.15);
    }
  } else if (filter === "vintage") {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 0.85 + 45);
      data[i + 1] = Math.min(255, data[i + 1] * 0.8 + 35);
      data[i + 2] = Math.min(255, data[i + 2] * 0.75 + 10);
    }
  } else if (filter === "glitch") {
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() > 0.96) {
        data[i] = 255;
        data[i + 1] = 0;
        data[i + 2] = 255;
      }
      if (Math.random() > 0.98) {
        const t = data[i];
        data[i] = data[i + 2];
        data[i + 2] = t;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
