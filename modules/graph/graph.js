const graphCanvas = document.getElementById('graph-canvas');
const ctx = graphCanvas.getContext('2d');

const graphAlgoSelect = document.getElementById('graph-algo-select');
const graphSpeedSlider = document.getElementById('graph-speed-slider');
const btnGraphPlay = document.getElementById('btn-graph-play');
const btnGraphPause = document.getElementById('btn-graph-pause');
const btnGraphStep = document.getElementById('btn-graph-step');
const btnGraphReset = document.getElementById('btn-graph-reset');
const btnGraphRandom = document.getElementById('btn-graph-random');

let nodes = [];
let edges = []; // { from, to }
let adjList = {};
let startNodeId = 0;
let nodeRadius = 20;

const nodeColors = {
  unvisited: getCssColor('--color-default') || '#6C8EBF',
  queued: getCssColor('--color-compare') || '#FFD700',
  visiting: getCssColor('--color-pivot') || '#FF8C00',
  visited: getCssColor('--color-sorted') || '#4CAF50',
  start: getCssColor('--color-selected') || '#9B59B6'
};

function resizeGraphCanvas() {
  const rect = graphCanvas.parentElement.getBoundingClientRect();
  graphCanvas.width = rect.width;
  graphCanvas.height = rect.height;
  if (nodes.length > 0) renderGraph();
}

window.addEventListener('resize', resizeGraphCanvas);

// Generate random graph using force directed/random scattered
function generateRandomGraph(nodeCount = 10) {
  nodes = [];
  edges = [];
  adjList = {};
  
  const w = graphCanvas.width || 800;
  const h = graphCanvas.height || 600;
  const margin = 50;
  
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i,
      x: margin + Math.random() * (w - 2 * margin),
      y: margin + Math.random() * (h - 2 * margin),
      state: 'unvisited'
    });
    adjList[i] = [];
  }
  
  // Random edges (make sure it's somewhat connected)
  for (let i = 0; i < nodeCount; i++) {
    const edgeCount = 1 + Math.floor(Math.random() * 3);
    for (let j = 0; j < edgeCount; j++) {
      const target = Math.floor(Math.random() * nodeCount);
      if (target !== i && !adjList[i].includes(target)) {
        adjList[i].push(target);
        adjList[target].push(i); // undirected
        edges.push({ from: i, to: target, highlighted: false });
      }
    }
  }
  startNodeId = 0;
  nodes[startNodeId].state = 'start';
}

function renderGraph() {
  ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  
  // Draw edges
  edges.forEach(edge => {
    const from = nodes[edge.from];
    const to = nodes[edge.to];
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = edge.highlighted ? '#FF4444' : (getCssColor('--border') || '#E0E0E0');
    if (edge.highlighted) {
      ctx.lineWidth = 4;
    } else {
      ctx.lineWidth = 2;
    }
    ctx.stroke();
  });
  
  // Draw nodes
  nodes.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
    
    // Determine color
    let fill = nodeColors[node.state];
    if (node.id === startNodeId && node.state === 'unvisited') {
      fill = nodeColors.start;
    }
    
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.id, node.x, node.y);
  });
}

// Interactions
graphCanvas.addEventListener('click', (e) => {
  if (animator.isRunning) return;
  const rect = graphCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
    if (dist <= nodeRadius) {
      startNodeId = i;
      resetGraphState();
      break;
    }
  }
});

function resetGraphState() {
  nodes.forEach(n => n.state = 'unvisited');
  edges.forEach(e => e.highlighted = false);
  if (nodes[startNodeId]) {
      nodes[startNodeId].state = 'start';
  }
  animator.reset();
  renderGraph();
}

// Algorithms
function bfsSteps(startId) {
  const steps = [];
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);
  
  steps.push({ type: 'queue', nodeId: startId });
  
  while (queue.length > 0) {
    const curr = queue.shift();
    steps.push({ type: 'visit', nodeId: curr });
    
    const neighbors = adjList[curr] || [];
    for (let neighbor of neighbors) {
      steps.push({ type: 'edge', from: curr, to: neighbor });
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        steps.push({ type: 'queue', nodeId: neighbor });
      }
    }
    steps.push({ type: 'done', nodeId: curr });
  }
  return steps;
}

function dfsSteps(startId) {
  const steps = [];
  const visited = new Set();
  
  function dfs(curr) {
    visited.add(curr);
    steps.push({ type: 'visit', nodeId: curr });
    
    const neighbors = adjList[curr] || [];
    for (let neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        steps.push({ type: 'edge', from: curr, to: neighbor });
        dfs(neighbor);
      }
    }
    steps.push({ type: 'done', nodeId: curr });
  }
  
  dfs(startId);
  return steps;
}

function runGraphSort(algorithm) {
  resetGraphState();
  const steps = algorithm === 'bfs' ? bfsSteps(startNodeId) : dfsSteps(startNodeId);
  
  animator.load(steps, (step) => {
    switch (step.type) {
      case 'queue':
        if (nodes[step.nodeId].state === 'unvisited' || nodes[step.nodeId].state === 'start') {
            nodes[step.nodeId].state = 'queued';
        }
        break;
      case 'visit':
        nodes[step.nodeId].state = 'visiting';
        break;
      case 'edge':
        edges.forEach(e => {
          if ((e.from === step.from && e.to === step.to) || (e.from === step.to && e.to === step.from)) {
            e.highlighted = true;
          }
        });
        break;
      case 'done':
        nodes[step.nodeId].state = 'visited';
        // clear edges related to this node
        edges.forEach(e => {
          if (e.from === step.nodeId || e.to === step.nodeId) {
             e.highlighted = false;
          }
        });
        break;
    }
    renderGraph();
  }, () => {
    edges.forEach(e => e.highlighted = false);
    renderGraph();
  });
  
  animator.play();
}

// UI Wireup
btnGraphRandom.addEventListener('click', () => {
  generateRandomGraph(12);
  resetGraphState();
});

btnGraphReset.addEventListener('click', resetGraphState);

btnGraphPlay.addEventListener('click', () => {
  if (animator.steps.length === 0 || animator.currentIndex >= animator.steps.length) {
    runGraphSort(graphAlgoSelect.value);
  } else {
    animator.play();
  }
});

btnGraphPause.addEventListener('click', () => animator.pause());

btnGraphStep.addEventListener('click', () => {
  if (animator.steps.length === 0 || animator.currentIndex >= animator.steps.length) {
    runGraphSort(graphAlgoSelect.value);
    animator.pause();
  }
  animator.stepForward();
});

graphSpeedSlider.addEventListener('input', (e) => animator.setSpeed(e.target.value));

// Init
setTimeout(() => {
  resizeGraphCanvas();
  generateRandomGraph(12);
  renderGraph();
}, 200); // slight delay to allow layout to compute
