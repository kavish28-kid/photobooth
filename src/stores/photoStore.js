const state = {
  localPhotos: [],
  peerPhotos: [],
  roomId: null,
  frameStyle: "strip",
  filterType: "normal",
  selectedPhotos: [],
};

export function setPhotos(local, peer, room) {
  state.localPhotos = [...local];
  state.peerPhotos = [...peer];
  state.roomId = room || null;
  state.selectedPhotos = [...local];
}

export function setFrameStyle(style) {
  state.frameStyle = style;
}

export function setFilterType(filter) {
  state.filterType = filter;
}

export function setSelectedPhotos(photos) {
  state.selectedPhotos = [...photos];
}

export function getState() {
  return { ...state };
}
