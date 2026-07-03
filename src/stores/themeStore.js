const state = {
  story: null,
  mood: null,
  midnight: false,
};

export function setStory(story) {
  state.story = story;
}

export function setMood(mood) {
  state.mood = mood;
}

export function getTheme() {
  return { ...state };
}

export function checkMidnight() {
  const h = new Date().getHours();
  state.midnight = h >= 0 && h < 5;
  return state.midnight;
}
