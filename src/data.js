export const scenes = [
  "Cold Open",
  "Enter FLARE",
  "Choose Story",
  "Waiting Room",
  "Booth",
  "Darkroom",
  "Memory Reveal",
  "Memory Universe",
];

export const stories = [
  { id: "couple", icon: "❤️", label: "Couple", tag: "Intimate · Warm", gradient: "linear-gradient(135deg,#FF2A75,#FF6F91)", mood: "warm" },
  { id: "friends", icon: "👥", label: "Friends", tag: "Loud · Bright", gradient: "linear-gradient(135deg,#FFE600,#FF6B2A)", mood: "bright" },
  { id: "birthday", icon: "🎂", label: "Birthday", tag: "Celebration · Color", gradient: "linear-gradient(135deg,#B2FF1A,#2A7FFF)", mood: "celebration" },
  { id: "graduation", icon: "🎓", label: "Graduation", tag: "Proud · Golden", gradient: "linear-gradient(135deg,#FFD700,#FF6B2A)", mood: "golden" },
  { id: "party", icon: "🎉", label: "Party", tag: "Night · Electric", gradient: "linear-gradient(135deg,#9B51E0,#FF2A75)", mood: "night" },
  { id: "holiday", icon: "🎄", label: "Holiday", tag: "Cozy · Magic", gradient: "linear-gradient(135deg,#00D4AA,#2A7FFF)", mood: "cozy" },
];

export const moods = [
  { id: "late-night", label: "Late Night", icon: "🌙", gradient: "linear-gradient(135deg,#0c0b1e,#1a1540)" },
  { id: "golden-hour", label: "Golden Hour", icon: "🌅", gradient: "linear-gradient(135deg,#FF6B2A,#FFE600)" },
  { id: "cafe", label: "Cafe", icon: "☕", gradient: "linear-gradient(135deg,#D4A574,#8B6B4A)" },
  { id: "rain", label: "Rain", icon: "🌧️", gradient: "linear-gradient(135deg,#4A5568,#718096)" },
  { id: "road-trip", label: "Road Trip", icon: "🛣️", gradient: "linear-gradient(135deg,#F59E0B,#D97706)" },
  { id: "old-money", label: "Old Money", icon: "👜", gradient: "linear-gradient(135deg,#1A1A2E,#2D2D44)" },
  { id: "y2k", label: "Y2K", icon: "💿", gradient: "linear-gradient(135deg,#FF2A75,#B2FF1A)" },
  { id: "dreamcore", label: "Dreamcore", icon: "💭", gradient: "linear-gradient(135deg,#C8A8FF,#FFE0EA)" },
  { id: "cyberpunk", label: "Cyberpunk", icon: "⚡", gradient: "linear-gradient(135deg,#FF006E,#00F5FF)" },
];

export const flareTalks = [
  "Ready?",
  "Smile.",
  "Closer.",
  "Perfect.",
  "One more.",
  "Beautiful.",
  "That's the one.",
  "Again.",
  "Yes.",
  "Hold it.",
];

export const liveReactions = ["😂", "❤️", "🔥", "👏", "✨", "😭", "🤍", "💀"];

export const achievements = [
  { id: "first-memory", label: "First Memory", icon: "⭐", desc: "Capture your first photo", threshold: 1 },
  { id: "golden-film", label: "Golden Film", icon: "🏆", desc: "100 memories unlocked", threshold: 100, secret: true },
  { id: "triple-threat", label: "Triple Threat", icon: "🎯", desc: "3 photos in one session", threshold: 3 },
  { id: "storyteller", label: "Storyteller", icon: "📖", desc: "Use all 6 stories", threshold: 6 },
];

export const filters = [
  ["Cherry Pop", "PINK · GLOSSY", "linear-gradient(140deg,#FF2A75,#FF6F91)", 8, "🍒"],
  ["Neon Lite", "LIME · EDGE", "linear-gradient(140deg,#B2FF1A,#FFE600)", 4, "💚"],
  ["Vibe Check", "PURPLE · DREAM", "linear-gradient(140deg,#9B51E0,#C8A8FF)", 16, "✨"],
  ["Sunset '00", "ORANGE · Y2K WARM", "linear-gradient(140deg,#FF6B2A,#FFE600)", 12, "🌅"],
  ["Electric", "BLUE · HIGH VOLTAGE", "linear-gradient(140deg,#2A7FFF,#00D4AA)", 6, "⚡"],
  ["Soft Focus", "LAVENDER · DUSTY", "linear-gradient(140deg,#C8A8FF,#FFE0EA)", 10, "🌸"],
  ["Iridescent", "PINK · BLUE · SHIFT", "linear-gradient(140deg,#FF2A75,#9B51E0,#2A7FFF)", 20, "🦋"],
];

export const frameStyles = [
  ["strip", "Film Strip", "Classic vertical 3-frame strip", "🎞️"],
  ["grid", "Grid", "2x2 polaroid layout", "📸"],
  ["polaroid", "Polaroid", "Single photo with white border", "🖼️"],
  ["classic", "Classic", "Clean borderless print", "🪟"],
];

export const photoFilters = [
  ["normal", "Normal", "True to life", "1.0"],
  ["warm", "Warm", "Golden hour glow", "1.2"],
  ["noir", "Noir", "High-contrast B&W", "1.1"],
  ["vintage", "Vintage", "Faded film stock", "1.3"],
  ["glitch", "Glitch", "Chromatic distortion", "1.0"],
];
