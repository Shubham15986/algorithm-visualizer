function generateRandomArray(size, min = 10, max = 100) {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return arr;
}

// Map color variables to actual CSS colors (useful for JS)
function getCssColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
