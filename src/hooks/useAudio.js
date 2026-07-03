import { useRef, useCallback } from "react";

let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function playTone(freq, duration, type = "sine", vol = 0.08) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration);
  } catch (e) { /* audio not available */ }
}

function playNoise(duration, vol = 0.03) {
  try {
    const c = getCtx();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const g = c.createGain();
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.connect(g);
    g.connect(c.destination);
    src.start();
  } catch (e) { /* audio not available */ }
}

export function useAudio() {
  const unlocked = useRef(false);

  const unlock = useCallback(() => {
    if (!unlocked.current && ctx && ctx.state === "suspended") ctx.resume();
    unlocked.current = true;
  }, []);

  const shutter = useCallback(() => {
    unlock();
    playNoise(0.08, 0.06);
    playTone(120, 0.04, "square", 0.05);
    setTimeout(() => playTone(1800, 0.06, "sine", 0.02), 10);
  }, [unlock]);

  const lensClose = useCallback(() => {
    unlock();
    playTone(80, 0.15, "sine", 0.04);
    setTimeout(() => playTone(60, 0.1, "sine", 0.03), 80);
  }, [unlock]);

  const lensOpen = useCallback(() => {
    unlock();
    playTone(200, 0.1, "sine", 0.03);
    setTimeout(() => playTone(350, 0.08, "sine", 0.02), 60);
  }, [unlock]);

  const countdownTick = useCallback(() => {
    unlock();
    playTone(600, 0.06, "sine", 0.04);
  }, [unlock]);

  const flashSound = useCallback(() => {
    unlock();
    playNoise(0.2, 0.1);
    playTone(3000, 0.15, "sine", 0.02);
  }, [unlock]);

  const printSound = useCallback(() => {
    unlock();
    playNoise(0.6, 0.04);
    for (let i = 0; i < 5; i++) setTimeout(() => playTone(800 + i * 200, 0.05, "square", 0.02), i * 80);
  }, [unlock]);

  const heartSound = useCallback(() => {
    unlock();
    playTone(440, 0.15, "sine", 0.04);
    setTimeout(() => playTone(660, 0.2, "sine", 0.03), 150);
  }, [unlock]);

  return { unlock, shutter, lensClose, lensOpen, countdownTick, flashSound, printSound, heartSound };
}
