const animator = {
  steps: [],
  currentIndex: 0,
  timerId: null,
  speed: 50,
  isRunning: false,
  onStep: null,
  onComplete: null,

  load(steps, onStepCallback, onCompleteCallback) {
    this.steps = steps;
    this.currentIndex = 0;
    this.onStep = onStepCallback;
    this.onComplete = onCompleteCallback;
  },

  play() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._tick();
  },

  _tick() {
    if (this.currentIndex >= this.steps.length) {
      this.isRunning = false;
      if (this.onComplete) this.onComplete();
      return;
    }
    
    if (this.onStep) this.onStep(this.steps[this.currentIndex]);
    this.currentIndex++;
    
    this.timerId = setTimeout(() => {
      if (this.isRunning) this._tick();
    }, this.speed);
  },

  pause() {
    clearTimeout(this.timerId);
    this.isRunning = false;
  },

  resume() {
    if (!this.isRunning) this.play();
  },

  stepForward() {
    this.pause();
    if (this.currentIndex < this.steps.length) {
      if (this.onStep) this.onStep(this.steps[this.currentIndex]);
      this.currentIndex++;
      if (this.currentIndex >= this.steps.length && this.onComplete) {
        this.onComplete();
      }
    }
  },

  reset() {
    this.pause();
    this.currentIndex = 0;
    this.steps = [];
  },

  setSpeed(val) {
    // Inverse relationship: higher slider value = lower delay
    // Slider 1 -> 1000ms delay, Slider 100 -> 10ms delay
    this.speed = Math.max(10, 1000 - (val * 9.9));
  }
};
