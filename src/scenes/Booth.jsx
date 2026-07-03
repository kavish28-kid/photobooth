import { useEffect, useState, useRef } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { useCamera } from "../hooks/useCamera.js";
import { usePeer } from "../hooks/usePeer.js";
import { setPhotos } from "../stores/photoStore.js";
import { flareTalks, liveReactions } from "../data.js";

export default function Booth({ index, active, goTo }) {
  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || null;
  });

  const { stream, error: cameraError, errorType, facingMode, isMock, startCamera, stopCamera } = useCamera();
  const {
    isHost,
    connected,
    remoteStreams,
    sendMessage,
    messages,
    remotePhoto,
    setRemotePhoto,
    disconnect,
    peerCount,
  } = usePeer(roomId, stream);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef([]);

  const [count, setCount] = useState(null);
  const [boothState, setBoothState] = useState("idle");
  const [flash, setFlash] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [peerPhotos, setPeerPhotos] = useState([]);
  const [copyStatus, setCopyStatus] = useState("Share link");
  const [showQR, setShowQR] = useState(false);
  const [flareTalk, setFlareTalk] = useState("");
  const [reactions, setReactions] = useState([]);
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    if (boothState !== "printed") return;
    const stored = parseInt(localStorage.getItem("flare-sessions") || "0") + 1;
    localStorage.setItem("flare-sessions", stored);
    let msg = null;
    if (stored === 5) msg = { icon: "⭐", text: "5 sessions! You're a regular ✦" };
    if (stored === 20) msg = { icon: "🏆", text: "Golden Film Unlocked ✦" };
    if (stored === 50) msg = { icon: "💫", text: "FLARE Legend ✦" };
    if (msg) { setAchievement(msg); setTimeout(() => setAchievement(null), 4000); }
  }, [boothState]);

  useEffect(() => {
    if (active && !stream && boothState === "idle") {
      startCamera(facingMode);
    }
  }, [active, stream, startCamera, facingMode, boothState]);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    remoteStreams.forEach((s, i) => {
      if (remoteVideoRefs.current[i]) {
        remoteVideoRefs.current[i].srcObject = s;
      }
    });
  }, [remoteStreams]);

  useEffect(() => {
    if (!active) {
      stopCamera();
      disconnect();
      setBoothState("idle");
      setCount(null);
      setCapturedPhotos([]);
      setPeerPhotos([]);
      setRemotePhoto(null);
    }
  }, [active, stopCamera, disconnect]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type === "start-countdown") {
      runCountdownSequence();
    } else if (lastMsg.type === "reaction") {
      setReactions((prev) => [...prev, { emoji: lastMsg.payload, id: Date.now(), x: Math.random() * 80 + 10, remote: true }]);
      setTimeout(() => setReactions((prev) => prev.slice(1)), 2000);
    }
  }, [messages]);

  useEffect(() => {
    if (remotePhoto) {
      setPeerPhotos((prev) => [...prev, remotePhoto]);
      setRemotePhoto(null);
    }
  }, [remotePhoto, setRemotePhoto]);

  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${randomId}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    if (goTo) goTo(2);
  };

  const handleLeaveRoom = () => {
    disconnect();
    setRoomId(null);
    setPeerPhotos([]);
    setCapturedPhotos([]);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    startCamera(facingMode);
  };

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "FLARE Photobooth", url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus("Share link"), 2000);
      });
    }
  };

  const capturePhoto = (videoEl) => {
    if (!videoEl && !isMock) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    if (videoEl && !isMock && facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    if (videoEl) {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#FF2A75");
      grad.addColorStop(0.5, "#9B51E0");
      grad.addColorStop(1, "#2A7FFF");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 36px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("📸", 320, 250);
    }
    return canvas.toDataURL("image/png");
  };

  const startSession = () => {
    if (roomId && !isHost) return;
    if (roomId && isHost) {
      sendMessage("start-countdown");
    }
    runCountdownSequence();
  };

  const runCountdownSequence = async () => {
    setBoothState("countdown");
    setCapturedPhotos([]);
    setPeerPhotos([]);
    const snaps = [];
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let shot = 1; shot <= 3; shot++) {
      for (let i = 3; i > 0; i--) {
        setCount(i);
        setFlareTalk(flareTalks[Math.floor(Math.random() * flareTalks.length)]);
        await delay(800);
      }
      setCount("📷");
      setFlareTalk("");
      await delay(200);

      setFlash(true);
      const snap = capturePhoto(localVideoRef.current);
      if (snap) {
        snaps.push(snap);
        setCapturedPhotos([...snaps]);
        if (roomId) {
          sendMessage("photo", snap);
        }
      }
      await delay(150);
      setFlash(false);
      await delay(600);
    }

    setCount(null);
    setBoothState("developing");
    await delay(2000);
    setBoothState("printed");
  };

  const sendReaction = (emoji) => {
    setReactions((prev) => [...prev, { emoji, id: Date.now(), x: Math.random() * 80 + 10 }]);
    if (roomId) sendMessage("reaction", emoji);
    setTimeout(() => setReactions((prev) => prev.slice(1)), 2000);
  };

  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    startCamera(nextMode);
  };

  const handleDownloadStrip = () => {
    const isMulti = roomId && connected && peerPhotos.length >= 3;
    const numPhotos = 3;
    const canvas = document.createElement("canvas");
    const photoWidth = 280;
    const photoHeight = 210;
    const margin = 20;
    const sprocketWidth = 30;

    const colWidth = photoWidth + margin * 2;
    const canvasWidth = isMulti ? colWidth * 2 + sprocketWidth * 2 : colWidth + sprocketWidth * 2;
    const canvasHeight = numPhotos * (photoHeight + margin) + margin + 80;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0c0b0e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, canvasWidth - 10, canvasHeight - 10);

    const drawSprockets = (x) => {
      ctx.fillStyle = "#1e1b22";
      for (let y = 15; y < canvasHeight - 90; y += 40) {
        ctx.fillRect(x, y, 12, 18);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeRect(x, y, 12, 18);
      }
    };

    drawSprockets(10);
    drawSprockets(canvasWidth - 22);

    let imagesLoaded = 0;
    const totalImages = isMulti ? 6 : 3;

    const onAllLoaded = () => {
      ctx.fillStyle = "#948da3";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.fillText("FLARE PHOTOBOOTH", sprocketWidth + margin, canvasHeight - 45);

      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      ctx.fillText(today.toUpperCase(), sprocketWidth + margin, canvasHeight - 30);

      ctx.fillStyle = "#5a5567";
      ctx.fillText(`ROOM: ${roomId || "SOLO"}`, canvasWidth - 160, canvasHeight - 45);
      ctx.fillText("ROLL 03 / EXP 24", canvasWidth - 160, canvasHeight - 30);

      const link = document.createElement("a");
      link.download = `flare-filmstrip-${roomId || "solo"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const drawPhotoFrame = (img, col, row) => {
      const colX = sprocketWidth + col * colWidth + margin;
      const rowY = margin + row * (photoHeight + margin);
      ctx.fillStyle = "#111827";
      ctx.fillRect(colX - 4, rowY - 4, photoWidth + 8, photoHeight + 8);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(colX - 4, rowY - 4, photoWidth + 8, photoHeight + 8);
      ctx.drawImage(img, colX, rowY, photoWidth, photoHeight);
      ctx.fillStyle = "rgba(139, 92, 246, 0.04)";
      ctx.fillRect(colX, rowY, photoWidth, photoHeight);
    };

    const loadImg = (src, col, row) => {
      const img = new Image();
      img.onload = () => {
        drawPhotoFrame(img, col, row);
        imagesLoaded++;
        if (imagesLoaded === totalImages) onAllLoaded();
      };
      img.src = src;
    };

    capturedPhotos.forEach((src, idx) => loadImg(src, 0, idx));
    if (isMulti) peerPhotos.forEach((src, idx) => loadImg(src, 1, idx));
  };

  const shareUrl = roomId
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : "";

  const showSplit = roomId && connected && remoteStreams.length > 0;
  const gridCols = showSplit ? Math.min(remoteStreams.length + 1, 4) : 1;
  const focusing = boothState === "countdown" && count !== null;
  const lensClosed = boothState === "countdown" && count === "📷";

  return (
    <Scene index={index}>
      <div className={`flash-overlay ${flash ? "flash-now" : ""}`} />
      <div className="lens-vignette" />
      <div className="film-grain" />
      <div className={`focus-ring ${focusing ? "focus-active" : ""}`} />
      <div className={`lens-shutter ${lensClosed ? "shutter-closed" : ""}`} />

      <div className="booth-machine">
        <div className="booth-copy">
          <div className="eyebrow">Real photobooth ✦</div>
          <Headline>say cheese, <span className="grad-text">in real time ✦</span></Headline>
          <p className="sub">
            Capture genuine smiles with live camera feed processing. Join a session to sync counts and snaps across screens.
          </p>

          <div className="booth-controls-panel">
            {!roomId ? (
              <div className="room-create-section">
                <p className="room-status-desc">Want to snap with friends? Create a shared session.</p>
                <button className="btn btn-outline magnetic" onClick={handleCreateRoom}>
                  ✨ Create Multiplayer Room
                </button>
              </div>
            ) : (
              <div className="room-active-section">
                <div className="room-info-badge">
                  <span className="room-dot active" />
                  <span>Room: <strong className="room-code">{roomId}</strong></span>
                </div>
                <div className="room-status-indicator">
                  {connected ? (
                    <span className="success-txt">✓ Connected — {peerCount} peer{peerCount !== 1 ? "s" : ""}</span>
                  ) : (
                    <span className="waiting-txt">⏳ Waiting for friends to join...</span>
                  )}
                </div>

                <div className="room-actions-group">
                  <button className="btn btn-outline btn-sm magnetic" onClick={handleCopyLink}>
                    {copyStatus}
                  </button>
                  <button className="btn btn-outline btn-sm magnetic" onClick={() => setShowQR(!showQR)}>
                    {showQR ? "Hide QR" : "Show QR"}
                  </button>
                  <button className="btn btn-danger btn-sm magnetic" onClick={handleLeaveRoom}>
                    Leave Room
                  </button>
                </div>

                {showQR && (
                  <div className="qr-box-container">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(shareUrl)}`}
                      alt="QR Code to Join"
                      className="qr-img"
                    />
                    <p className="qr-caption">Scan with mobile to join instantly</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="booth-view-container">
          <div className="booth-screen-wrap">
            <div className="hud">
              <span><span className="rec" />LIVE{isMock ? " (MOCK)" : ""}</span>
              <span>{roomId ? `ROOM: ${roomId}` : "SOLO"}</span>
            </div>

            <div
              className="camera-grid"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              }}
            >
              <div className="video-feed-wrapper">
                {isMock ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="video-feed"
                  />
                ) : stream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`video-feed ${facingMode === "user" ? "mirrored" : ""}`}
                  />
                ) : (
                  <div className="feed-placeholder">Starting camera...</div>
                )}
                <span className="feed-tag">You</span>
              </div>

              {showSplit && remoteStreams.map((_, idx) => (
                <div key={idx} className="video-feed-wrapper remote">
                  <video
                    ref={(el) => { remoteVideoRefs.current[idx] = el; }}
                    autoPlay
                    playsInline
                    className="video-feed"
                  />
                  <span className="feed-tag">Peer {idx + 1}</span>
                </div>
              ))}
            </div>

            {flareTalk && <div className="flare-talk">{flareTalk}</div>}
            {count !== null && <div className="countdown-overlay">{count}</div>}

            {reactions.length > 0 && (
              <div className="reactions-container">
                {reactions.map((r) => (
                  <span key={r.id} className="reaction-float" style={{ left: `${r.x}%` }}>{r.emoji}</span>
                ))}
              </div>
            )}

            <div className="booth-status-bar">
              <span>{boothState.toUpperCase()}{isMock ? " (MOCK)" : ""}</span>
              <span>ROLL 03 / 24 EXP</span>
            </div>
          </div>

          <div className="booth-action-footer">
            {stream && !isMock && (
              <button className="btn btn-outline circular-btn magnetic" onClick={toggleFacingMode} title="Toggle Camera">
                🔄
              </button>
            )}

            {boothState === "idle" && (
              <div className="reaction-buttons">
                {liveReactions.map((emoji) => (
                  <button key={emoji} className="reaction-btn" onClick={() => sendReaction(emoji)}>{emoji}</button>
                ))}
              </div>
            )}

            {boothState === "printed" ? (
              <div className="finished-actions-group">
                <button
                  className="btn btn-primary magnetic"
                  onClick={() => {
                    setPhotos(capturedPhotos, peerPhotos, roomId);
                    if (goTo) goTo(5);
                  }}
                >
                  Keep this Forever ✦
                </button>
                <button className="btn btn-outline magnetic" onClick={handleDownloadStrip}>
                  📥 Save Strip
                </button>
                <button className="btn btn-outline magnetic" onClick={startSession}>
                  Retake
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary start-booth-btn magnetic"
                onClick={startSession}
                disabled={boothState !== "idle" || (roomId && !connected) || (roomId && !isHost)}
              >
                {roomId && !isHost
                  ? "Waiting for your friend..."
                  : boothState !== "idle"
                  ? "Capturing..."
                  : "✨ Create a Memory"}
              </button>
            )}
          </div>

          {achievement && (
            <div className="achievement-toast">
              <span className="achievement-icon">{achievement.icon}</span>
              <span className="achievement-text">{achievement.text}</span>
            </div>
          )}

          {boothState === "printed" && capturedPhotos.length > 0 && (
            <div className="film-strip-preview-overlay">
              <p className="strip-title">FILM STRIP PREVIEW</p>
              <div className="preview-strip">
                {capturedPhotos.map((src, idx) => (
                  <div key={idx} className="preview-frame">
                    <img src={src} alt={`Snap ${idx + 1}`} className="preview-img" />
                    {roomId && connected && peerPhotos[idx] && (
                      <img src={peerPhotos[idx]} alt={`Peer Snap ${idx + 1}`} className="preview-img peer" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Scene>
  );
}
