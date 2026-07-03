import { useState, useCallback, useRef } from "react";

function createMockStream() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  let frameId;

  const draw = () => {
    const t = Date.now() / 1000;
    ctx.clearRect(0, 0, 640, 480);

    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#FF2A75");
    grad.addColorStop(0.5, "#9B51E0");
    grad.addColorStop(1, "#2A7FFF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    for (let i = 0; i < 3; i++) {
      const ox = Math.sin(t * 0.5 + i * 2) * 80;
      const oy = Math.cos(t * 0.4 + i * 1.5) * 60;
      ctx.beginPath();
      ctx.arc(320 + ox, 240 + oy, 50 - i * 12, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + i * 0.04})`;
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "bold 28px 'Plus Jakarta Sans', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📸", 320, 210);
    ctx.font = "16px 'Inter', system-ui, sans-serif";
    ctx.fillText("Camera preview unavailable", 320, 270);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "13px 'Inter', system-ui, sans-serif";
    ctx.fillText("— mock feed —", 320, 300);

    frameId = requestAnimationFrame(draw);
  };
  draw();

  const stream = canvas.captureStream(30);
  stream.__flareMock = true;
  stream.__stopMock = () => cancelAnimationFrame(frameId);
  return stream;
}

export function useCamera() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [facingMode, setFacingMode] = useState("user");
  const [isMock, setIsMock] = useState(false);
  const streamRef = useRef(null);
  const mockRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      if (streamRef.current.__flareMock && streamRef.current.__stopMock) {
        streamRef.current.__stopMock();
      }
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setStream(null);
      setIsMock(false);
    }
  }, []);

  const startCamera = useCallback(async (mode = "user") => {
    stopCamera();
    try {
      setError(null);
      setErrorType(null);
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setFacingMode(mode);
      setIsMock(false);
      return mediaStream;
    } catch (err) {
      console.error("Camera access error:", err);
      let msg = "Unable to access camera. Please check permissions.";
      let type = "unknown";

      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Camera access was denied.";
        type = "denied";
      } else if (err.name === "NotFoundError") {
        msg = "No camera found on this device.";
        type = "notfound";
      } else if (err.name === "NotReadableError") {
        msg = "Camera is in use by another app.";
        type = "inuse";
      }

      setError(msg);
      setErrorType(type);

      const mockStream = createMockStream();
      streamRef.current = mockStream;
      setStream(mockStream);
      setIsMock(true);
      return mockStream;
    }
  }, [stopCamera]);

  return {
    stream,
    error,
    errorType,
    facingMode,
    isMock,
    startCamera,
    stopCamera,
  };
}
