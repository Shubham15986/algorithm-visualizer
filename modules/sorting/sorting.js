// modules/sorting/sorting.js

const sortCanvas = document.getElementById('sort-canvas');
const sortCanvas2 = document.getElementById('sort-canvas-2');
const sortCanvasContainer1 = document.getElementById('sort-canvas-container-1');
const sortCanvasContainer2 = document.getElementById('sort-canvas-container-2');
const canvasTitle1 = document.getElementById('canvas-title-1');
const canvasTitle2 = document.getElementById('canvas-title-2');
const battleWinner = document.getElementById('battle-winner');

const statComparisons = document.getElementById('stat-comparisons');
const statSwaps = document.getElementById('stat-swaps');
const statAccesses = document.getElementById('stat-accesses');
const statTime = document.getElementById('stat-time');

const statComparisons2 = document.getElementById('stat-comparisons-2');
const statSwaps2 = document.getElementById('stat-swaps-2');
const statAccesses2 = document.getElementById('stat-accesses-2');
const statTime2 = document.getElementById('stat-time-2');
const statsBar2 = document.getElementById('stats-bar-2');

// Info Panel UI
const codeDisplay = document.getElementById('code-display');
const bestCase = document.getElementById('best-case');
const avgCase = document.getElementById('avg-case');
const worstCase = document.getElementById('worst-case');
const spaceCase = document.getElementById('space-case');
const complexityChart = document.getElementById('complexity-chart');
const chartCtx = complexityChart ? complexityChart.getContext('2d') : null;

// UI Controls
const algoSelect = document.getElementById('algo-select');
const algoSelect2 = document.getElementById('algo-select-2');
const battleModeToggle = document.getElementById('battle-mode-toggle');
const datasetSelect = document.getElementById('dataset-select');
const speedSlider = document.getElementById('speed-slider');
const sizeSlider = document.getElementById('size-slider');
const btnPlay = document.getElementById('btn-play');
const btnPause = document.getElementById('btn-pause');
const btnStep = document.getElementById('btn-step');
const btnReset = document.getElementById('btn-reset');
const btnCustom = document.getElementById('btn-custom');
const customInput = document.getElementById('custom-input');

// Quiz Mode UI
const btnQuiz = document.getElementById('btn-quiz');
const quizOverlay = document.getElementById('quiz-overlay');
const quizOptions = document.getElementById('quiz-options');
const quizFeedback = document.getElementById('quiz-feedback');
const btnQuizExit = document.getElementById('btn-quiz-exit');

let bars = [];
let bars2 = [];
let opHistory = [];
let battleState = { finished1: false, finished2: false };

const datasets = {
  random: null,
  buildings: [
    { label: "Burj Khalifa", value: 828 },
    { label: "Merdeka 118", value: 678 },
    { label: "Shanghai Tower", value: 632 },
    { label: "Makkah Clock", value: 601 },
    { label: "Ping An", value: 599 },
    { label: "Lotte Tower", value: 555 },
    { label: "One World Trade", value: 541 },
    { label: "Guangzhou CTF", value: 530 },
    { label: "Tianjin CTF", value: 530 },
    { label: "CITIC Tower", value: 527 },
    { label: "TAIPEI 101", value: 508 },
    { label: "Shanghai WFC", value: 492 },
    { label: "ICC", value: 484 }
  ],
  population: [
    { label: "China", value: 1425 },
    { label: "India", value: 1428 },
    { label: "USA", value: 339 },
    { label: "Indonesia", value: 277 },
    { label: "Pakistan", value: 240 },
    { label: "Nigeria", value: 223 },
    { label: "Brazil", value: 216 },
    { label: "Bangladesh", value: 172 },
    { label: "Russia", value: 144 },
    { label: "Mexico", value: 128 },
    { label: "Japan", value: 123 },
    { label: "Ethiopia", value: 126 }
  ]
};

const algorithmInfo = {
  bubbleSort: {
    best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    code: [
      "for i from 0 to n-1:",
      "  for j from 0 to n-i-2:",
      "    if arr[j] > arr[j+1]:",
      "      swap arr[j] and arr[j+1]",
      "  mark arr[n-i-1] as sorted"
    ]
  },
  selectionSort: {
    best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    code: [
      "for i from 0 to n-1:",
      "  minIdx = i",
      "  for j from i+1 to n:",
      "    if arr[j] < arr[minIdx]:",
      "      minIdx = j",
      "  if minIdx != i:",
      "    swap arr[i] and arr[minIdx]"
    ]
  },
  insertionSort: {
    best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    code: [
      "for i from 1 to n-1:",
      "  key = arr[i]",
      "  j = i - 1",
      "  while j >= 0 and arr[j] > key:",
      "    arr[j+1] = arr[j]",
      "    j--",
      "  arr[j+1] = key"
    ]
  },
  mergeSort: {
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)",
    code: [
      "function mergeSort(arr, left, right):",
      "  if left >= right: return",
      "  mid = (left + right) / 2",
      "  mergeSort(arr, left, mid)",
      "  mergeSort(arr, mid+1, right)",
      "  merge(arr, left, mid, right)"
    ]
  },
  quickSort: {
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)",
    code: [
      "function quickSort(arr, low, high):",
      "  if low < high:",
      "    pivot = partition(arr, low, high)",
      "    quickSort(arr, low, pivot-1)",
      "    quickSort(arr, pivot+1, high)",
      "function partition(arr, low, high):",
      "  pivot = arr[high]",
      "  for j from low to high-1:",
      "    if arr[j] < pivot: swap",
      "  swap pivot to correct position"
    ]
  },
  heapSort: {
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)",
    code: [
      "function heapSort(arr):",
      "  buildMaxHeap(arr)",
      "  for i from n-1 down to 1:",
      "    swap arr[0] and arr[i]",
      "    heapify(arr, i, 0)"
    ]
  }
};

function updateInfoPanel(algo) {
  const info = algorithmInfo[algo];
  if (!info) return;
  bestCase.textContent = info.best;
  avgCase.textContent = info.avg;
  worstCase.textContent = info.worst;
  spaceCase.textContent = info.space;
  
  if (codeDisplay) {
    codeDisplay.innerHTML = info.code.map((line, idx) => 
      `<div class="code-line" data-line="${idx}">${line}</div>`
    ).join('');
  }
}

function highlightCodeLine(lineIndex) {
  if (lineIndex === undefined) return;
  document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
  const activeLine = document.querySelector(`.code-line[data-line="${lineIndex}"]`);
  if (activeLine) activeLine.classList.add('active');
}

function redrawComplexityChart(step, totalSteps, ops) {
  if (!chartCtx) return;
  opHistory.push({ step, ops });
  
  const w = complexityChart.width;
  const h = complexityChart.height;
  
  chartCtx.clearRect(0, 0, w, h);
  chartCtx.beginPath();
  chartCtx.strokeStyle = getCssColor('--accent');
  chartCtx.lineWidth = 2;
  
  const maxOps = Math.max(...opHistory.map(h => h.ops), 10);
  
  opHistory.forEach((point, i) => {
    const x = (point.step / totalSteps) * w;
    const y = h - (point.ops / maxOps) * h;
    i === 0 ? chartCtx.moveTo(x, y) : chartCtx.lineTo(x, y);
  });
  chartCtx.stroke();
}

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("module")) state.activeModule = params.get("module");
  if (params.get("algo")) state.sorting.algorithm = params.get("algo");
  if (params.get("algo2")) state.sorting.algorithm2 = params.get("algo2");
  if (params.get("size")) state.sorting.size = parseInt(params.get("size"));
  if (params.get("speed")) speedSlider.value = params.get("speed");
  if (params.get("battle") === "true") state.sorting.battleMode = true;
  
  algoSelect.value = state.sorting.algorithm || "bubbleSort";
  if (algoSelect2) algoSelect2.value = state.sorting.algorithm2 || "selectionSort";
  sizeSlider.value = state.sorting.size;
  if (battleModeToggle) battleModeToggle.checked = state.sorting.battleMode;
  
  if (state.sorting.battleMode) enableBattleMode(true);
}

function updateURL() {
  const params = new URLSearchParams();
  params.set("module", state.activeModule);
  params.set("algo", state.sorting.algorithm);
  params.set("algo2", state.sorting.algorithm2 || "selectionSort");
  params.set("size", state.sorting.size);
  params.set("speed", speedSlider.value);
  params.set("battle", state.sorting.battleMode);
  window.history.replaceState({}, "", `?${params.toString()}`);
}

function enableBattleMode(enable) {
  if (enable) {
    algoSelect2.style.display = 'block';
    sortCanvasContainer2.style.display = 'flex';
    statsBar2.style.display = 'flex';
    canvasTitle1.style.display = 'block';
    canvasTitle1.textContent = algoSelect.options[algoSelect.selectedIndex].text;
    canvasTitle2.textContent = algoSelect2.options[algoSelect2.selectedIndex].text;
  } else {
    algoSelect2.style.display = 'none';
    sortCanvasContainer2.style.display = 'none';
    statsBar2.style.display = 'none';
    canvasTitle1.style.display = 'none';
  }
}

// Initialize
function initSorting() {
  parseURLParams();
  animator.setSpeed(speedSlider.value);
  updateInfoPanel(state.sorting.algorithm);
  resetVisualizer();
  
  // Event Listeners
  speedSlider.addEventListener('input', (e) => {
    animator.setSpeed(e.target.value);
    updateURL();
  });
  sizeSlider.addEventListener('input', (e) => {
    state.sorting.size = parseInt(e.target.value);
    datasetSelect.value = "random";
    updateURL();
    resetVisualizer();
  });
  algoSelect.addEventListener('change', (e) => {
    state.sorting.algorithm = e.target.value;
    updateInfoPanel(state.sorting.algorithm);
    if (state.sorting.battleMode) canvasTitle1.textContent = e.target.options[e.target.selectedIndex].text;
    updateURL();
    resetVisualizer();
  });
  if (algoSelect2) {
    algoSelect2.addEventListener('change', (e) => {
      state.sorting.algorithm2 = e.target.value;
      canvasTitle2.textContent = e.target.options[e.target.selectedIndex].text;
      updateURL();
      resetVisualizer();
    });
  }
  if (battleModeToggle) {
    battleModeToggle.addEventListener('change', (e) => {
      state.sorting.battleMode = e.target.checked;
      enableBattleMode(e.target.checked);
      updateURL();
      resetVisualizer();
    });
  }
  datasetSelect.addEventListener('change', (e) => {
    resetVisualizer();
  });
  
  btnPlay.addEventListener('click', () => {
    if (animator.steps.length === 0 || animator.currentIndex >= animator.steps.length) {
      runSort();
    } else {
      animator.play();
    }
  });
  btnPause.addEventListener('click', () => animator.pause());
  btnStep.addEventListener('click', () => {
    if (animator.steps.length === 0 || animator.currentIndex >= animator.steps.length) {
      runSort();
      animator.pause();
    }
    animator.stepForward();
  });
  btnReset.addEventListener('click', resetVisualizer);
  
  btnCustom.addEventListener('click', () => {
    const vals = customInput.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    if (vals.length > 0) {
      state.sorting.array = vals.map(v => ({ value: v, label: v }));
      state.sorting.size = vals.length;
      sizeSlider.value = vals.length;
      datasetSelect.value = "random";
      renderBars(state.sorting.array, sortCanvas, bars);
      if (state.sorting.battleMode) renderBars(state.sorting.array, sortCanvas2, bars2);
      animator.reset();
      resetStats();
    }
  });
  
  if (btnQuiz) btnQuiz.addEventListener('click', startQuizMode);
  if (btnQuizExit) btnQuizExit.addEventListener('click', exitQuizMode);
  
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        updateURL();
        navigator.clipboard.writeText(window.location.href);
        alert("URL copied to clipboard!");
      });
  }
}

function resetVisualizer() {
  const dataset = datasets[datasetSelect.value];
  if (dataset) {
    state.sorting.array = [...dataset];
    state.sorting.size = dataset.length;
    sizeSlider.value = dataset.length;
  } else {
    // Generate simple integers, but wrap in objects to support labels
    state.sorting.array = generateRandomArray(state.sorting.size).map(v => ({ value: v, label: v }));
  }
  
  renderBars(state.sorting.array, sortCanvas, bars);
  if (state.sorting.battleMode) renderBars(state.sorting.array, sortCanvas2, bars2);
  
  animator.reset();
  resetStats();
  battleWinner.style.display = 'none';
}

function resetStats() {
  state.sorting.comparisons = 0;
  state.sorting.swaps = 0;
  state.sorting.arrayAccesses = 0;
  state.sorting.startTime = 0;
  
  state.sorting.comparisons2 = 0;
  state.sorting.swaps2 = 0;
  state.sorting.arrayAccesses2 = 0;
  state.sorting.startTime2 = 0;
  
  opHistory = [];
  if (chartCtx) {
    chartCtx.clearRect(0, 0, complexityChart.width, complexityChart.height);
  }
  updateStatsUI();
}

function updateStatsUI() {
  statComparisons.textContent = state.sorting.comparisons;
  statSwaps.textContent = state.sorting.swaps;
  statAccesses.textContent = state.sorting.arrayAccesses;
  
  statComparisons2.textContent = state.sorting.comparisons2;
  statSwaps2.textContent = state.sorting.swaps2;
  statAccesses2.textContent = state.sorting.arrayAccesses2;
}

function renderBars(array, container, barsArray) {
  container.innerHTML = '';
  barsArray.length = 0; // clear array in place
  
  const maxVal = Math.max(...array.map(item => item.value));
  
  array.forEach((item) => {
    const bar = document.createElement('div');
    bar.classList.add('array-bar');
    const heightPct = (item.value / maxVal) * 90;
    bar.style.height = `${heightPct}%`;
    
    if (array.length <= 40 || datasetSelect.value !== 'random') {
      const label = document.createElement('span');
      label.classList.add('array-bar-label');
      label.textContent = item.label;
      if (datasetSelect.value !== 'random') {
        label.style.writingMode = 'vertical-rl';
        label.style.transform = 'rotate(180deg)';
        label.style.paddingTop = '5px';
      }
      bar.appendChild(label);
    }
    
    container.appendChild(bar);
    barsArray.push(bar);
  });
}

function updateBar(index, colorVar, heightVal = null, maxVal = null, barsArray = bars) {
  if (index < 0 || index >= barsArray.length) return;
  const bar = barsArray[index];
  if (colorVar) {
    bar.style.backgroundColor = `var(${colorVar})`;
  }
  if (heightVal !== null && maxVal !== null) {
    const heightPct = (heightVal.value / maxVal) * 90;
    bar.style.height = `${heightPct}%`;
    const label = bar.querySelector('.array-bar-label');
    if (label) label.textContent = heightVal.label;
  }
}

// Entry point for starting the sort
function runSort() {
  animator.reset();
  resetStats();
  if (!state.quizMode) updateInfoPanel(state.sorting.algorithm);
  state.sorting.startTime = performance.now();
  state.sorting.startTime2 = performance.now();
  battleWinner.style.display = 'none';
  battleState = { finished1: false, finished2: false };
  
  const arrayCopy1 = [...state.sorting.array];
  let steps1 = getStepsForAlgo(state.quizMode ? state.quizAnswer : state.sorting.algorithm, arrayCopy1, 1);
  
  let combinedSteps = [];
  
  if (state.sorting.battleMode && !state.quizMode) {
      const arrayCopy2 = [...state.sorting.array];
      let steps2 = getStepsForAlgo(state.sorting.algorithm2, arrayCopy2, 2);
      
      // Combine steps alternately to simulate parallel execution
      const maxLength = Math.max(steps1.length, steps2.length);
      for (let i = 0; i < maxLength; i++) {
          if (i < steps1.length) combinedSteps.push(steps1[i]);
          if (i < steps2.length) combinedSteps.push(steps2[i]);
      }
  } else {
      combinedSteps = steps1;
  }
  
  const maxVal = Math.max(...state.sorting.array.map(i => i.value));
  
  animator.load(combinedSteps, 
    (step) => applyStep(step, maxVal), 
    () => {
      // On Complete
      if (!state.sorting.battleMode) {
          const elapsed = Math.round(performance.now() - state.sorting.startTime);
          statTime.textContent = `${elapsed}ms`;
          bars.forEach((_, i) => updateBar(i, '--color-sorted', null, null, bars));
      }
      
      if (state.quizMode) {
          quizFeedback.textContent = "Animation Finished! Make your guess.";
      }
    }
  );
  
  animator.play();
}

function getStepsForAlgo(algoName, array, playerNum) {
    switch(algoName) {
        case 'bubbleSort': return bubbleSortSteps(array, playerNum);
        case 'selectionSort': return selectionSortSteps(array, playerNum);
        case 'insertionSort': return insertionSortSteps(array, playerNum);
        case 'mergeSort': return mergeSortSteps(array, playerNum);
        case 'quickSort': return quickSortSteps(array, playerNum);
        case 'heapSort': return heapSortSteps(array, playerNum);
        default: return [];
    }
}

function applyStep(step, maxVal) {
  const targetBars = step.player === 2 ? bars2 : bars;
  const isP2 = step.player === 2;
  
  switch(step.type) {
    case 'compare':
      updateBar(step.indices[0], '--color-compare', null, null, targetBars);
      updateBar(step.indices[1], '--color-compare', null, null, targetBars);
      if (isP2) {
          state.sorting.comparisons2++;
          state.sorting.arrayAccesses2 += 2;
      } else {
          state.sorting.comparisons++;
          state.sorting.arrayAccesses += 2;
      }
      
      if (step.revert) {
        step.revert.forEach(idx => updateBar(idx, '--color-default', null, null, targetBars));
      }
      break;
      
    case 'swap':
      updateBar(step.indices[0], '--color-swap', step.values[0], maxVal, targetBars);
      updateBar(step.indices[1], '--color-swap', step.values[1], maxVal, targetBars);
      if (isP2) {
          state.sorting.swaps2++;
          state.sorting.arrayAccesses2 += 4;
      } else {
          state.sorting.swaps++;
          state.sorting.arrayAccesses += 4;
      }
      break;
      
    case 'sorted':
      step.indices.forEach(idx => updateBar(idx, '--color-sorted', null, null, targetBars));
      break;
      
    case 'clear':
      step.indices.forEach(idx => updateBar(idx, '--color-default', null, null, targetBars));
      break;
      
    case 'finished':
      if (isP2) {
          battleState.finished2 = true;
          const elapsed = Math.round(performance.now() - state.sorting.startTime2);
          statTime2.textContent = `${elapsed}ms`;
          bars2.forEach((_, i) => updateBar(i, '--color-sorted', null, null, bars2));
          if (!battleState.finished1 && state.sorting.battleMode) {
              battleWinner.style.display = 'block';
              battleWinner.style.left = '75%';
              battleWinner.textContent = "Algorithm 2 Wins! 🏆";
          }
      } else {
          battleState.finished1 = true;
          const elapsed = Math.round(performance.now() - state.sorting.startTime);
          statTime.textContent = `${elapsed}ms`;
          bars.forEach((_, i) => updateBar(i, '--color-sorted', null, null, bars));
          if (!battleState.finished2 && state.sorting.battleMode) {
              battleWinner.style.display = 'block';
              battleWinner.style.left = '25%';
              battleWinner.textContent = "Algorithm 1 Wins! 🏆";
          }
      }
      break;
  }
  
  if (!isP2 && !state.quizMode) {
      highlightCodeLine(step.codeLine);
      const totalOps = state.sorting.comparisons + state.sorting.swaps;
      // Rough estimation of total steps to render chart nicely. Just use max steps
      redrawComplexityChart(animator.currentIndex, Math.max(animator.steps.length, 1), totalOps);
  }
  
  updateStatsUI();
}

// algorithms returning steps with playerNum attached
function wrapStep(step, playerNum) {
    step.player = playerNum;
    return step;
}

function bubbleSortSteps(array, playerNum) {
  const steps = [];
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      const revert = j > 0 ? [j - 1, j] : [];
      steps.push(wrapStep({ type: 'compare', indices: [j, j + 1], revert, codeLine: 2 }, playerNum));
      if (array[j].value > array[j + 1].value) {
        let temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
        steps.push(wrapStep({ type: 'swap', indices: [j, j + 1], values: [array[j], array[j + 1]], codeLine: 3 }, playerNum));
      }
    }
    steps.push(wrapStep({ type: 'clear', indices: [n - i - 2, n - i - 1] }, playerNum));
    steps.push(wrapStep({ type: 'sorted', indices: [n - i - 1], codeLine: 4 }, playerNum));
  }
  steps.push(wrapStep({ type: 'sorted', indices: [0], codeLine: 4 }, playerNum));
  steps.push(wrapStep({ type: 'finished' }, playerNum));
  return steps;
}

function selectionSortSteps(array, playerNum) {
  const steps = [];
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      steps.push(wrapStep({ type: 'compare', indices: [minIdx, j], revert: [j] }, playerNum));
      if (array[j].value < array[minIdx].value) {
        minIdx = j;
      }
    }
    steps.push(wrapStep({ type: 'clear', indices: [n - 1] }, playerNum));
    if (minIdx !== i) {
      let temp = array[i];
      array[i] = array[minIdx];
      array[minIdx] = temp;
      steps.push(wrapStep({ type: 'swap', indices: [i, minIdx], values: [array[i], array[minIdx]] }, playerNum));
    }
    steps.push(wrapStep({ type: 'sorted', indices: [i] }, playerNum));
  }
  steps.push(wrapStep({ type: 'sorted', indices: [n - 1] }, playerNum));
  steps.push(wrapStep({ type: 'finished' }, playerNum));
  return steps;
}

function insertionSortSteps(array, playerNum) {
  const steps = [];
  const n = array.length;
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    steps.push(wrapStep({ type: 'compare', indices: [i], revert: [] }, playerNum));
    while (j >= 0 && array[j].value > key.value) {
      steps.push(wrapStep({ type: 'compare', indices: [j, j + 1], revert: [j] }, playerNum));
      array[j + 1] = array[j];
      steps.push(wrapStep({ type: 'swap', indices: [j, j + 1], values: [array[j], array[j + 1]] }, playerNum));
      j--;
    }
    array[j + 1] = key;
    steps.push(wrapStep({ type: 'swap', indices: [j + 1, j + 1], values: [key, key] }, playerNum)); 
    steps.push(wrapStep({ type: 'clear', indices: [j + 1] }, playerNum));
  }
  steps.push(wrapStep({ type: 'finished' }, playerNum));
  return steps;
}

function mergeSortSteps(array, playerNum) {
  const steps = [];
  
  function merge(arr, left, mid, right) {
    let n1 = mid - left + 1;
    let n2 = right - mid;
    let L = new Array(n1);
    let R = new Array(n2);
    
    for (let i = 0; i < n1; i++) L[i] = arr[left + i];
    for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
    
    let i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
      steps.push(wrapStep({ type: 'compare', indices: [left + i, mid + 1 + j], revert: [left + i, mid + 1 + j] }, playerNum));
      if (L[i].value <= R[j].value) {
        arr[k] = L[i];
        steps.push(wrapStep({ type: 'swap', indices: [k, k], values: [arr[k], arr[k]] }, playerNum));
        i++;
      } else {
        arr[k] = R[j];
        steps.push(wrapStep({ type: 'swap', indices: [k, k], values: [arr[k], arr[k]] }, playerNum));
        j++;
      }
      k++;
    }
    
    while (i < n1) {
      arr[k] = L[i];
      steps.push(wrapStep({ type: 'swap', indices: [k, k], values: [arr[k], arr[k]] }, playerNum));
      i++;
      k++;
    }
    
    while (j < n2) {
      arr[k] = R[j];
      steps.push(wrapStep({ type: 'swap', indices: [k, k], values: [arr[k], arr[k]] }, playerNum));
      j++;
      k++;
    }
  }

  function mergeSort(arr, left, right) {
    if (left >= right) return;
    let mid = left + Math.floor((right - left) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
  
  mergeSort(array, 0, array.length - 1);
  steps.push(wrapStep({ type: 'finished' }, playerNum));
  return steps;
}

function quickSortSteps(array, playerNum) {
  const steps = [];
  
  function partition(arr, low, high) {
    let pivot = arr[high];
    steps.push(wrapStep({ type: 'compare', indices: [high], revert: [] }, playerNum)); 
    
    let i = low - 1;
    for (let j = low; j <= high - 1; j++) {
      steps.push(wrapStep({ type: 'compare', indices: [j, high], revert: [j] }, playerNum));
      if (arr[j].value < pivot.value) {
        i++;
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        steps.push(wrapStep({ type: 'swap', indices: [i, j], values: [arr[i], arr[j]] }, playerNum));
      }
    }
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    steps.push(wrapStep({ type: 'swap', indices: [i + 1, high], values: [arr[i + 1], arr[high]] }, playerNum));
    steps.push(wrapStep({ type: 'clear', indices: [high] }, playerNum));
    return i + 1;
  }
  
  function quickSort(arr, low, high) {
    if (low < high) {
      let pi = partition(arr, low, high);
      quickSort(arr, low, pi - 1);
      quickSort(arr, pi + 1, high);
    }
  }
  
  quickSort(array, 0, array.length - 1);
  steps.push(wrapStep({ type: 'finished' }, playerNum));
  return steps;
}

function heapSortSteps(array, playerNum) {
  const steps = [];
  const n = array.length;
  
  function heapify(arr, N, i) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    
    if (l < N) {
      steps.push(wrapStep({ type: 'compare', indices: [l, largest], revert: [l, largest] }, playerNum));
      if (arr[l].value > arr[largest].value) largest = l;
    }
    
    if (r < N) {
      steps.push(wrapStep({ type: 'compare', indices: [r, largest], revert: [r, largest] }, playerNum));
      if (arr[r].value > arr[largest].value) largest = r;
    }
    
    if (largest !== i) {
      let swap = arr[i];
      arr[i] = arr[largest];
      arr[largest] = swap;
      steps.push(wrapStep({ type: 'swap', indices: [i, largest], values: [arr[i], arr[largest]] }, playerNum));
      heapify(arr, N, largest);
    }
  }
  
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(array, n, i);
  }
  
  for (let i = n - 1; i > 0; i--) {
    let temp = array[0];
    array[0] = array[i];
    array[i] = temp;
    steps.push(wrapStep({ type: 'swap', indices: [0, i], values: [array[0], array[i]] }, playerNum));
    steps.push(wrapStep({ type: 'sorted', indices: [i] }, playerNum));
    heapify(array, i, 0);
  }
  steps.push(wrapStep({ type: 'sorted', indices: [0] }, playerNum));
  steps.push(wrapStep({ type: 'finished' }, playerNum));
  return steps;
}

// Quiz Mode
function startQuizMode() {
  state.quizMode = true;
  quizOverlay.style.display = 'flex';
  battleModeToggle.checked = false;
  state.sorting.battleMode = false;
  enableBattleMode(false);
  
  const algos = Object.keys(algorithmInfo);
  state.quizAnswer = algos[Math.floor(Math.random() * algos.length)];
  
  quizFeedback.textContent = "Watch the animation carefully...";
  
  // Options
  quizOptions.innerHTML = '';
  algos.forEach(algo => {
    const btn = document.createElement('button');
    btn.className = 'btn outline';
    btn.style.color = 'white';
    btn.style.borderColor = 'white';
    btn.textContent = algoSelect.querySelector(`option[value="${algo}"]`).textContent;
    btn.onclick = () => guessAlgorithm(algo, btn);
    quizOptions.appendChild(btn);
  });
  
  resetVisualizer();
  runSort();
}

function guessAlgorithm(algo, btn) {
  if (algo === state.quizAnswer) {
    quizFeedback.textContent = "✅ Correct! It was " + btn.textContent;
    btn.style.backgroundColor = 'var(--color-sorted)';
    btn.style.borderColor = 'var(--color-sorted)';
  } else {
    quizFeedback.textContent = "❌ Wrong! It was actually " + algoSelect.querySelector(`option[value="${state.quizAnswer}"]`).textContent;
    btn.style.backgroundColor = 'var(--color-swap)';
    btn.style.borderColor = 'var(--color-swap)';
  }
}

function exitQuizMode() {
  state.quizMode = false;
  quizOverlay.style.display = 'none';
  animator.reset();
  resetVisualizer();
}

// Start
initSorting();
