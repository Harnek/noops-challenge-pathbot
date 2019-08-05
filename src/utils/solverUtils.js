import { createBoard, getNewPosition, getNewDirection } from './boardUtils';

function Solver() {
  let visited;
  let stack;
  let handler;

  return {
    initSolver,
    solve,
  };

  function initSolver(size, callback) {
    visited = createBoard(size);
    for (let i = 0; i < size; i += 1) {
      for (let j = 0; j < size; j += 1) {
        visited[i][j] = false;
      }
    }
    stack = [];
    handler = callback;
  }

  // TODO: add distance based method
  function solve(x, y, exits, mazeExitDirection, mazeExitDistance) {
    if (!visited[x][y]) {
      visited[x][y] = true;
      stack.push([x, y]);
    }
    const bestDirection = getBestDirections(mazeExitDirection);
    for (let i = 0; i < bestDirection.length; i += 1) {
      if (exits.includes(bestDirection[i])) {
        const [newX, newY] = getNewPosition(x, y, bestDirection[i]);
        if (!visited[newX][newY]) {
          return handler(bestDirection[i]);
        }
      }
    }
    stack.pop();
    return handler(getNewDirection(x, y, ...stack[stack.length - 1]));
  }

  function getBestDirections(direction) {
    if (direction === 'W' || direction === 'NW') {
      return ['W', 'N', 'E', 'S'];
    }
    if (direction === 'N' || direction === 'NE') {
      return ['N', 'E', 'W', 'S'];
    }
    if (direction === 'E' || direction === 'SE') {
      return ['E', 'S', 'N', 'W'];
    }
    // direction === 'S' || direction === 'SW'
    return ['S', 'W', 'E', 'N'];
  }
}

export default Solver;
