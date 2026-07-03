import { useEffect, useState, useRef } from "react";
import Scene from "../components/scene/Scene.jsx";
import Headline from "../components/ui/Headline.jsx";
import { useCamera } from "../hooks/useCamera.js";
import { usePeer } from "../hooks/usePeer.js";

export default function Booth({ index, active }) {
  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("room") || null;
  });

  const { stream, error: cameraError, facingMode, startCamera, stopCamera } = useCamera();
  const {
    isHost,
    connected,
    remoteStream,
    sendMessage,
    messages,
    remotePhoto,
    setRemotePhoto,
    disconnect,
  } = usePeer(roomId, stream);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [count, setCount] = useState(null);
  const [boothState, setBoothState] = useState("idle"); // idle, starting, countdown, flash, developing, printed
  const [flash, setFlash] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]); // Array of local snaps
  const [peerPhotos, setPeerPhotos] = useState([]); // Array of remote snaps
  const [copyStatus, setCopyStatus] = useState("Copy link");
  const [showQR, setShowQR] = useState(false);

  // Bind local stream
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

  // Bind remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Stop camera on scene leave
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

  // Handle incoming PeerJS messages
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.type === "start-countdown") {
      runCountdownSequence();
    }
  }, [messages]);

  // Handle incoming remote photo updates
  useEffect(() => {
    if (remotePhoto) {
      setPeerPhotos((prev) => [...prev, remotePhoto]);
      setRemotePhoto(null);
    }
  }, [remotePhoto, setRemotePhoto]);

  // Create room
  const handleCreateRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
    // Push state to browser URL without refreshing
    const newUrl = `${window.location.origin}${window.location.pathname}?room=${randomId}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  // Leave room
  const handleLeaveRoom = () => {
    disconnect();
    setRoomId(null);
    setPeerPhotos([]);
    setCapturedPhotos([]);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
    startCamera(facingMode);
  };

  // Copy share link
  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy link"), 2000);
    });
  };

  // Capture photo from local video stream
  const capturePhoto = (videoEl) => {
    if (!videoEl) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");

    // Mirror horizontal view if front camera (user facing)
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  };

  // Start countdown sequence
  const startSession = () => {
    if (roomId && !isHost) return; // Only host starts

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

    // We will take 3 photos in sequence
    for (let shot = 1; shot <= 3; shot++) {
      // 3 seconds countdown per photo
      for (let i = 3; i > 0; i--) {
        setCount(i);
        await delay(800);
      }
      setCount("📷");
      await delay(200);

      // Flash & Capture
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

  // Toggle front/back camera
  const toggleFacingMode = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    startCamera(nextMode);
  };

  // Generate and download final retro film strip PNG
  const handleDownloadStrip = () => {
    const isMulti = roomId && connected && peerPhotos.length >= 3;
    const numPhotos = 3;

    const canvas = document.createElement("canvas");
    // Width: Single column = 360, Dual column = 680
    const photoWidth = 280;
    const photoHeight = 210;
    const margin = 20;
    const sprocketWidth = 30;

    const colWidth = photoWidth + margin * 2;
    const canvasWidth = isMulti ? colWidth * 2 + sprocketWidth * 2 : colWidth + sprocketWidth * 2;
    const canvasHeight = numPhotos * (photoHeight + margin) + margin + 80;

    const ctx = canvas.getContext("2d");

    // 1. Draw film strip background (deep dark zinc)
    ctx.fillStyle = "#0c0b0e";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw retro film border lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.strokeRect(5, 5, canvasWidth - 10, canvasHeight - 10);

    // Helper to draw sprocket holes
    const drawSprockets = (x) => {
      ctx.fillStyle = "#1e1b22";
      for (let y = 15; y < canvasHeight - 90; y += 40) {
        ctx.fillRect(x, y, 12, 18);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.strokeRect(x, y, 12, 18);
      }
    };

    // Draw sprockets on sides
    drawSprockets(10);
    drawSprockets(canvasWidth - 22);

    // Load and draw images
    let imagesLoaded = 0;
    const totalImages = isMulti ? 6 : 3;

    const onAllLoaded = () => {
      // 3. Draw Branding & Meta text at bottom
      ctx.fillStyle = "#948da3";
      ctx.font = "bold 10px 'Space Mono', monospace";
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

      // Trigger download
      const link = document.createElement("a");
      link.download = `flare-filmstrip-${roomId || "solo"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    const drawPhotoFrame = (img, col, row) => {
      const colX = sprocketWidth + col * colWidth + margin;
      const rowY = margin + row * (photoHeight + margin);

      // Draw photo container border
      ctx.fillStyle = "#111827";
      ctx.fillRect(colX - 4, rowY - 4, photoWidth + 8, photoHeight + 8);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeRect(colX - 4, rowY - 4, photoWidth + 8, photoHeight + 8);

      // Draw image
      ctx.drawImage(img, colX, rowY, photoWidth, photoHeight);

      // Apply subtle vignette effect/vintage tint
      ctx.fillStyle = "rgba(139, 92, 246, 0.04)"; // slight violet tint
      ctx.fillRect(colX, rowY, photoWidth, photoHeight);
    };

    const loadImg = (src, col, row) => {
      const img = new Image();
      img.onload = () => {
        drawPhotoFrame(img, col, row);
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          onAllLoaded();
        }
      };
      img.src = src;
    };

    // Load local snaps
    capturedPhotos.forEach((src, idx) => loadImg(src, 0, idx));

    // Load peer snaps if multiplayer
    if (isMulti) {
      peerPhotos.forEach((src, idx) => loadImg(src, 1, idx));
    }
  };

  const shareUrl = roomId
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : "";

  return (
    <Scene index={index}>
      <div className={`flash-overlay ${flash ? "flash-now" : ""}`} />

      <div className="booth-machine">
        <div className="booth-copy">
          <div className="eyebrow">Real photobooth</div>
          <Headline>Say cheese, <span className="coral">in real time.</span></Headline>
          <p className="sub">
            Capture genuine smiles with live camera feed processing. Join a session to sync counts and snaps across screens.
          </p>

          <div className="booth-controls-panel">
            {!roomId ? (
              <div className="room-create-section">
                <p className="room-status-desc">Want to snap with friends? Create a shared session.</p>
                <button className="btn btn-outline magnetic" onClick={handleCreateRoom}>
                  Create Multiplayer Room
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
                    <span className="success-txt">✓ Connected with Peer</span>
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
              <span><span className="rec" />LIVE</span>
              <span>{roomId ? `ROOM: ${roomId}` : "SOLO"}</span>
            </div>

            <div className={`camera-grid ${roomId && connected ? "split" : "single"}`}>
              {/* Local Feed */}
              <div className="video-feed-wrapper">
                {cameraError ? (
                  <div className="camera-error-view">{cameraError}</div>
                ) : (
                  <>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`video-feed ${facingMode === "user" ? "mirrored" : ""}`}
                    />
                    <span className="feed-tag">You</span>
                  </>
                )}
              </div>

              {/* Remote Feed */}
              {roomId && connected && (
                <div className="video-feed-wrapper remote">
                  {remoteStream ? (
                    <>
                      <video ref={remoteVideoRef} autoPlay playsInline className="video-feed" />
                      <span className="feed-tag">Friend</span>
                    </>
                  ) : (
                    <div className="feed-placeholder">Connecting stream...</div>
                  )}
                </div>
              )}
            </div>

            {count !== null && <div className="countdown-overlay">{count}</div>}

            <div className="booth-status-bar">
              <span>{boothState.toUpperCase()}</span>
              <span>ROLL 03 / 24 EXP</span>
            </div>
          </div>

          <div className="booth-action-footer">
            {stream && (
              <button className="btn btn-outline circular-btn magnetic" onClick={toggleFacingMode} title="Toggle Camera">
                🔄
              </button>
            )}

            {boothState === "printed" ? (
              <div className="finished-actions-group">
                <button className="btn btn-primary magnetic" onClick={handleDownloadStrip}>
                  📥 Download Film Strip
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
                  ? "Waiting for Host..."
                  : boothState !== "idle"
                  ? "Snapping..."
                  : "Start Photo Session"}
              </button>
            )}
          </div>

          {/* Film Strip Preview */}
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
