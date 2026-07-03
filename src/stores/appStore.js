const state = {
  memories: [],
  totalMemories: 0,
  achievements: [],
  reaction: null,
  surpriseReady: false,
  sessionCount: 0,
};

export function addMemory(photo) {
  state.memories.push({ id: Date.now(), src: photo, date: new Date() });
  state.totalMemories++;
  state.sessionCount++;
  checkAchievements();
}

export function setReaction(r) {
  state.reaction = r;
  setTimeout(() => { state.reaction = null; }, 2000);
}

export function getAppState() {
  return { ...state, memories: [...state.memories] };
}

export function triggerSurprise() {
  state.surpriseReady = true;
  setTimeout(() => { state.surpriseReady = false; }, 5000);
}

function checkAchievements() {
  if (state.totalMemories === 1 && !state.achievements.includes("first-memory")) {
    state.achievements.push("first-memory");
  }
  if (state.totalMemories >= 100 && !state.achievements.includes("golden-film")) {
    state.achievements.push("golden-film");
  }
  if (state.sessionCount >= 3 && !state.achievements.includes("triple-threat")) {
    state.achievements.push("triple-threat");
  }
}
