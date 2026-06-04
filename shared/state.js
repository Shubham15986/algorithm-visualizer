const state = {
  activeModule: "sorting",
  sorting: {
    array: [],
    algorithm: "bubbleSort",
    animationSteps: [],
    currentStep: 0,
    isPlaying: false,
    speed: 50,
    size: 30,
    comparisons: 0,
    swaps: 0,
    arrayAccesses: 0,
    startTime: 0,
    customInput: "",
  },
  theme: "light"
};

function setState(module, key, value) {
  if (module) {
    state[module][key] = value;
  } else {
    state[key] = value;
  }
}
