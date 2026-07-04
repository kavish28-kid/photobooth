import { useEffect, useState, useRef, useCallback } from "react";
import Scene from "../components/scene/Scene.jsx";
import { useCamera } from "../hooks/useCamera.js";
import { usePeer } from "../hooks/usePeer.js";
import { setPhotos } from "../stores/photoStore.js";
import { flareTalks, liveReactions } from "../data.js";
import { useAudio } from "../hooks/useAudio.js";
import { getTheme } from "../stores/themeStore.js";

export default function Booth({ index, active, goTo }) {
  const audio = useAudio();
  const theme = getTheme();
  const storyGradient = theme.story?.gradient || "var(--grad-main)";

  const urlRoom = new URLSearchParams(window.location.search).get("room");
  const storedRoom = sessionStorage.getItem("flare-last-room-id");
  const initialRoomId = urlRoom || storedRoom || null;
  const initialIsHost = urlRoom ? (storedRoom === urlRoom) : !!storedRoom;

  const [roomId, setRoomId] = useState(initialRoomId);
  const [userIsHost, setUserIsHost] = useState(initialIsHost);

  const { stream, error: cameraError, errorType, facingMode, isMock, startCamera, stopCamera } = useCamera();
  const { isHost, connected, remoteStreams, sendMessage, messages, remotePhoto, setRemotePhoto, disconnect, peerCount } = usePeer(roomId, stream, userIsHost);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef([]);
  const [count, setCount] = useState(null);
  const [boothState, setBoothState] = useState("idle");
  const [flash, setFlash] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [peerPhotos, setPeerPhotos] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [flareTalk, setFlareTalk] = useState("");
  const [reactions, setReactions] = useState([]);
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    if (active && !stream && boothState === "idle") startCamera(facingMode);
  }, [active, stream, startCamera, facingMode, boothState]);

  useEffect(() => {
    if (localVideoRef.current && stream) localVideoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    remoteStreams.forEach((s, i) => { if (remoteVideoRefs.current[i]) remoteVideoRefs.current[i].srcObject = s; });
  }, [remoteStreams]);

  useEffect(() => {
    if (!active) { stopCamera(); disconnect(); setBoothState("idle"); setCount(null); setCapturedPhotos([]); setPeerPhotos([]); setRemotePhoto(null); setShowActions(false); }
  }, [active, stopCamera, disconnect]);

  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.type === "start-countdown") runCountdownSequence();
    else if (lastMsg.type === "reaction") {
      setReactions((prev) => [...prev, { emoji: lastMsg.payload, id: Date.now(), x: Math.random() * 80 + 10, remote: true }]);
      setTimeout(() => setReactions((prev) => prev.slice(1)), 2000);
    }
  }, [messages]);

  useEffect(() => {
    if (remotePhoto) { setPeerPhotos((prev) => [...prev, remotePhoto]); setRemotePhoto(null); }
  }, [remotePhoto, setRemotePhoto]);

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

  const handleCreateRoom = useCallback(() => {
    audio.lensOpen();
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
    setUserIsHost(true);
    sessionStorage.setItem("flare-last-room-id", randomId);
    if (goTo) goTo(4);
  }, [audio, goTo]);

  const handleLeaveRoom = useCallback(() => {
    disconnect();
    sessionStorage.removeItem("flare-last-room-id");
    setRoomId(null);
    setUserIsHost(false);
    setPeerPhotos([]);
    setCapturedPhotos([]);
    startCamera(facingMode);
  }, [disconnect, startCamera, facingMode]);

  const handleCopyLink = useCallback(() => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    if (navigator.share) navigator.share({ title: "FLARE Photobooth", url: shareUrl }).catch(() => {});
    else navigator.clipboard.writeText(shareUrl);
  }, [roomId]);

  const capturePhoto = (videoEl) => {
    if (!videoEl && !isMock) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (videoEl && !isMock && facingMode === "user") { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    if (videoEl) ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    else {
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#FF2A75"); grad.addColorStop(0.5, "#9B51E0"); grad.addColorStop(1, "#2A7FFF");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "bold 36px system-ui"; ctx.textAlign = "center"; ctx.fillText("📸", 320, 250);
    }
    return canvas.toDataURL("image/png");
  };

  const startSession = useCallback(() => {
    if (roomId && !isHost) return;
    if (roomId && isHost) sendMessage("start-countdown");
    audio.lensClose();
    runCountdownSequence();
  }, [roomId, isHost, sendMessage, audio]);

  const runCountdownSequence = async () => {
    setBoothState("countdown");
    setCapturedPhotos([]);
    setPeerPhotos([]);
    const snaps = [];
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let shot = 1; shot <= 3; shot++) {
      for (let i = 3; i > 0; i--) {
        setCount(i);
        audio.countdownTick();
        setFlareTalk(flareTalks[Math.floor(Math.random() * flareTalks.length)]);
        await delay(800);
      }
      setCount("📷");
      setFlareTalk("");
      audio.lensClose();
      await delay(200);
      audio.shutter();
      setFlash(true);
      const snap = capturePhoto(localVideoRef.current);
      if (snap) { snaps.push(snap); setCapturedPhotos([...snaps]); if (roomId) sendMessage("photo", snap); }
      await delay(150);
      setFlash(false);
      audio.lensOpen();
      await delay(600);
    }
    setCount(null);
    setBoothState("developing");
    await delay(1500);
    audio.printSound();
    setBoothState("printed");
    setShowActions(true);
  };

  const toggleFacingMode = useCallback(() => startCamera(facingMode === "user" ? "environment" : "user"), [facingMode, startCamera]);

  const sendReaction = useCallback((emoji) => {
    setReactions((prev) => [...prev, { emoji, id: Date.now(), x: Math.random() * 80 + 10 }]);
    if (roomId) sendMessage("reaction", emoji);
    setTimeout(() => setReactions((prev) => prev.slice(1)), 2000);
  }, [roomId, sendMessage]);

  const handleKeep = useCallback(() => {
    setPhotos(capturedPhotos, peerPhotos, roomId);
    if (goTo) goTo(5);
  }, [capturedPhotos, peerPhotos, roomId, goTo]);

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

      <div className="booth-fullscreen">
        <div className="booth-screen-wrap">
          <div className="hud">
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="rec" />LIVE{isMock ? " (MOCK)" : ""}
            </span>
            <span>{roomId ? `ROOM: ${roomId}` : "SOLO"}</span>
            {roomId && (
              <span style={{ display: "flex", gap: 6 }}>
                <button className="hud-btn" onClick={handleCopyLink} title="Share link">🔗</button>
                <button className="hud-btn" onClick={handleLeaveRoom} title="Leave">✕</button>
              </span>
            )}
          </div>

          <div className="camera-grid" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            <div className="video-feed-wrapper">
              {isMock ? <video ref={localVideoRef} autoPlay playsInline muted className="video-feed" />
               : stream ? <video ref={localVideoRef} autoPlay playsInline muted className={`video-feed ${facingMode === "user" ? "mirrored" : ""}`} />
               : <div className="feed-placeholder">Starting camera...</div>}
              <span className="feed-tag">You</span>
            </div>
            {showSplit && remoteStreams.map((_, idx) => (
              <div key={idx} className="video-feed-wrapper remote">
                <video ref={(el) => { remoteVideoRefs.current[idx] = el; }} autoPlay playsInline className="video-feed" />
                <span className="feed-tag">Peer {idx + 1}</span>
              </div>
            ))}
          </div>

          {flareTalk && <div className="flare-talk">{flareTalk}</div>}
          {count !== null && <div className="countdown-overlay">{count}</div>}

          {reactions.length > 0 && (
            <div className="reactions-container">
              {reactions.map((r) => (<span key={r.id} className="reaction-float" style={{ left: `${r.x}%` }}>{r.emoji}</span>))}
            </div>
          )}

          <div className="booth-status-bar">
            <span>{boothState.toUpperCase()}{isMock ? " (MOCK)" : ""}</span>
            <span>ROLL 03 / 24 EXP</span>
          </div>
        </div>

        {!roomId && boothState === "idle" && (
          <div className="booth-overlay-center">
            <div className="room-prompt" style={{ "--prompt-grad": storyGradient }}>
              <p>Create a room to sync with friends, or snap solo</p>
              <div className="room-prompt-actions">
                <button className="btn btn-primary booth-start-btn" onClick={handleCreateRoom}>✦ Create Room</button>
                <button className="btn btn-outline booth-start-btn" onClick={startSession}>Solo Snap</button>
              </div>
            </div>
          </div>
        )}

        {roomId && !connected && boothState === "idle" && (
          <div className="booth-overlay-center">
            <div className="room-prompt">
              <p>Waiting for friends to join...</p>
              <div className="room-prompt-actions">
                <button className="btn btn-primary booth-start-btn" onClick={handleCopyLink}>Share Link</button>
              </div>
            </div>
          </div>
        )}

        <div className="booth-bottom-bar">
          {boothState === "idle" && roomId && connected && (
            <div className="booth-bottom-left">
              <div className="room-badge"><span className="room-dot active" /> {peerCount} peer{peerCount !== 1 ? "s" : ""}</div>
              <div className="reaction-buttons">
                {liveReactions.map((emoji) => (
                  <button key={emoji} className="reaction-btn" onClick={() => sendReaction(emoji)}>{emoji}</button>
                ))}
              </div>
            </div>
          )}

          <div className="booth-bottom-center">
            {stream && !isMock && boothState === "idle" && (
              <button className="btn btn-outline circular-btn" onClick={toggleFacingMode} title="Flip camera">🔄</button>
            )}
            {boothState === "idle" && (
              roomId && connected ? (
                <button className="btn btn-primary booth-start-btn" onClick={startSession} disabled={!isHost}>
                  {isHost ? "✦ Create a Memory" : "Waiting for your friend..."}
                </button>
              ) : !roomId ? (
                <button className="btn btn-primary booth-start-btn" onClick={startSession}>
                  Solo Snap
                </button>
              ) : null
            )}
            {boothState !== "idle" && boothState !== "printed" && (
              <div className="booth-recording-indicator">
                <span className="rec rec-large" /> {boothState === "countdown" ? "CAPTURING" : "DEVELOPING"}
              </div>
            )}
          </div>

          {showActions && boothState === "printed" && (
            <div className="booth-bottom-actions">
              <button className="btn btn-primary" onClick={handleKeep}>Keep this Forever ✦</button>
              <button className="btn btn-outline" onClick={startSession}>Retake</button>
            </div>
          )}
        </div>

        {achievement && (
          <div className="achievement-toast">
            <span className="achievement-icon">{achievement.icon}</span>
            <span className="achievement-text">{achievement.text}</span>
          </div>
        )}
      </div>
    </Scene>
  );
}
