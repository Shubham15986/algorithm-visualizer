const gridContainer = document.getElementById('grid-container');
const pathAlgoSelect = document.getElementById('path-algo-select');
const pathSpeedSlider = document.getElementById('path-speed-slider');
const btnPathPlay = document.getElementById('btn-path-play');
const btnPathPause = document.getElementById('btn-path-pause');
const btnPathClearPath = document.getElementById('btn-path-clear-path');
const btnPathClearBoard = document.getElementById('btn-path-clear-board');
const btnPathMaze = document.getElementById('btn-path-maze');

const ROWS = 20;
const COLS = 40;
let grid = [];
let startNode = { row: 10, col: 5 };
let endNode = { row: 10, col: 35 };

let isDrawingWall = false;
let isMovingStart = false;
let isMovingEnd = false;

function initGrid() {
  gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
  gridContainer.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
  
  grid = [];
  gridContainer.innerHTML = '';
  
  for (let r = 0; r < ROWS; r++) {
    const currentRow = [];
    for (let c = 0; c < COLS; c++) {
      const cellData = {
        row: r,
        col: c,
        isWall: false,
        isStart: r === startNode.row && c === startNode.col,
        isEnd: r === endNode.row && c === endNode.col,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        f: Infinity,
        g: Infinity,
        h: 0,
        previousNode: null
      };
      currentRow.push(cellData);
      
      const cellEl = document.createElement('div');
      cellEl.id = `cell-${r}-${c}`;
      cellEl.classList.add('grid-cell');
      if (cellData.isStart) cellEl.classList.add('start');
      if (cellData.isEnd) cellEl.classList.add('end');
      
      // Event Listeners for Interaction
      cellEl.addEventListener('mousedown', (e) => handleMouseDown(e, r, c));
      cellEl.addEventListener('mouseenter', (e) => handleMouseEnter(e, r, c));
      cellEl.addEventListener('mouseup', handleMouseUp);
      
      gridContainer.appendChild(cellEl);
    }
    grid.push(currentRow);
  }
}

gridContainer.addEventListener('mouseleave', handleMouseUp);

function handleMouseDown(e, r, c) {
  if (animator.isRunning) return;
  e.preventDefault(); // Prevent drag text selection
  const cell = grid[r][c];
  
  if (cell.isStart) {
    isMovingStart = true;
  } else if (cell.isEnd) {
    isMovingEnd = true;
  } else {
    isDrawingWall = true;
    toggleWall(r, c);
  }
}

function handleMouseEnter(e, r, c) {
  if (!isDrawingWall && !isMovingStart && !isMovingEnd) return;
  
  const cell = grid[r][c];
  if (isMovingStart && !cell.isEnd && !cell.isWall) {
    updateNodePosition('start', r, c);
  } else if (isMovingEnd && !cell.isStart && !cell.isWall) {
    updateNodePosition('end', r, c);
  } else if (isDrawingWall && !cell.isStart && !cell.isEnd) {
    toggleWall(r, c);
  }
}

function handleMouseUp() {
  isDrawingWall = false;
  isMovingStart = false;
  isMovingEnd = false;
}

function toggleWall(r, c) {
  const cell = grid[r][c];
  cell.isWall = !cell.isWall;
  const el = document.getElementById(`cell-${r}-${c}`);
  if (cell.isWall) {
      el.classList.add('wall');
      el.classList.remove('visited', 'path');
  }
  else el.classList.remove('wall');
}

function updateNodePosition(type, r, c) {
  const oldNode = type === 'start' ? startNode : endNode;
  grid[oldNode.row][oldNode.col][type === 'start' ? 'isStart' : 'isEnd'] = false;
  document.getElementById(`cell-${oldNode.row}-${oldNode.col}`).classList.remove(type);
  
  if (type === 'start') {
    startNode = { row: r, col: c };
    grid[r][c].isStart = true;
  } else {
    endNode = { row: r, col: c };
    grid[r][c].isEnd = true;
  }
  
  document.getElementById(`cell-${r}-${c}`).classList.add(type);
}

function clearPath() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = grid[r][c];
      cell.isVisited = false;
      cell.isPath = false;
      cell.distance = Infinity;
      cell.f = Infinity;
      cell.g = Infinity;
      cell.h = 0;
      cell.previousNode = null;
      
      const el = document.getElementById(`cell-${r}-${c}`);
      el.classList.remove('visited', 'path');
    }
  }
  animator.reset();
}

function clearBoard() {
  clearPath();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid[r][c].isWall = false;
      document.getElementById(`cell-${r}-${c}`).classList.remove('wall');
    }
  }
}

function getNeighbors(node) {
  const neighbors = [];
  const { row, col } = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < ROWS - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < COLS - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(n => !n.isWall);
}

// Dijkstra
function dijkstra() {
  clearPath();
  const visitedNodesInOrder = [];
  grid[startNode.row][startNode.col].distance = 0;
  
  const unvisitedNodes = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      unvisitedNodes.push(grid[r][c]);
    }
  }
  
  while (unvisitedNodes.length > 0) {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const closestNode = unvisitedNodes.shift();
    
    if (closestNode.isWall) continue;
    if (closestNode.distance === Infinity) break;
    
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    
    if (closestNode.isEnd) break;
    
    const unvisitedNeighbors = getNeighbors(closestNode).filter(n => !n.isVisited);
    for (const neighbor of unvisitedNeighbors) {
      if (closestNode.distance + 1 < neighbor.distance) {
        neighbor.distance = closestNode.distance + 1;
        neighbor.previousNode = closestNode;
      }
    }
  }
  return visitedNodesInOrder;
}

// A* Search
function aStar() {
  clearPath();
  const visitedNodesInOrder = [];
  
  const start = grid[startNode.row][startNode.col];
  const end = grid[endNode.row][endNode.col];
  
  start.g = 0;
  start.h = Math.abs(start.row - end.row) + Math.abs(start.col - end.col);
  start.f = start.g + start.h;
  
  const openSet = [start];
  
  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    
    current.isVisited = true;
    visitedNodesInOrder.push(current);
    
    if (current.isEnd) break;
    
    const unvisitedNeighbors = getNeighbors(current).filter(n => !n.isVisited);
    for (const neighbor of unvisitedNeighbors) {
      const tentativeG = current.g + 1;
      
      if (tentativeG < neighbor.g) {
        neighbor.previousNode = current;
        neighbor.g = tentativeG;
        neighbor.h = Math.abs(neighbor.row - end.row) + Math.abs(neighbor.col - end.col);
        neighbor.f = neighbor.g + neighbor.h;
        
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }
  return visitedNodesInOrder;
}

function getNodesInShortestPathOrder(endCell) {
  const nodesInShortestPathOrder = [];
  let currentNode = endCell;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}

function runPathfinding(algo) {
  const visitedNodesInOrder = algo === 'dijkstra' ? dijkstra() : aStar();
  const shortestPath = getNodesInShortestPathOrder(grid[endNode.row][endNode.col]);
  
  const steps = [];
  // First visit nodes
  for (let i = 0; i < visitedNodesInOrder.length; i++) {
    if (!visitedNodesInOrder[i].isStart && !visitedNodesInOrder[i].isEnd) {
      steps.push({ type: 'visit', node: visitedNodesInOrder[i] });
    }
  }
  // Then draw path
  if (grid[endNode.row][endNode.col].previousNode !== null) {
    for (let i = 1; i < shortestPath.length - 1; i++) {
      steps.push({ type: 'path', node: shortestPath[i] });
    }
  }
  
  animator.load(steps, (step) => {
    const el = document.getElementById(`cell-${step.node.row}-${step.node.col}`);
    if (step.type === 'visit') {
      el.classList.add('visited');
    } else if (step.type === 'path') {
      el.classList.remove('visited');
      el.classList.add('path');
    }
  });
  
  animator.play();
}

function generateMaze() {
  clearBoard();
  
  // Simple random maze for now
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!grid[r][c].isStart && !grid[r][c].isEnd) {
        if (Math.random() < 0.3) {
          toggleWall(r, c);
        }
      }
    }
  }
}

// UI Wireup
btnPathPlay.addEventListener('click', () => {
  if (animator.steps.length === 0 || animator.currentIndex >= animator.steps.length) {
    runPathfinding(pathAlgoSelect.value);
  } else {
    animator.play();
  }
});

btnPathPause.addEventListener('click', () => animator.pause());
btnPathClearPath.addEventListener('click', clearPath);
btnPathClearBoard.addEventListener('click', clearBoard);
btnPathMaze.addEventListener('click', generateMaze);

pathSpeedSlider.addEventListener('input', (e) => animator.setSpeed(e.target.value));

initGrid();
