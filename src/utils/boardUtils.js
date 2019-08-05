function initBoard(size) {
  return {
    board: createBoard(size),
    size,
    x: Math.floor(size / 2),
    y: Math.floor(size / 2),
  };
}

function createBoard(size) {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(null));
}

function getNewPosition(x, y, direction) {
  switch (direction) {
    case 'W':
      return [x, y - 1];
    case 'N':
      return [x - 1, y];
    case 'E':
      return [x, y + 1];
    case 'S':
      return [x + 1, y];
    default:
      return [x, y];
  }
}

function getNewDirection(x, y, newX, newY) {
  if ((x + 1 === newX || x - 1 === newX) && y === newY) {
    return x - 1 === newX ? 'N' : 'S';
  }
  if ((y + 1 === newY || y - 1 === newY) && x === newX) {
    return y - 1 === newY ? 'W' : 'E';
  }
  throw Error('Invalid Direction');
}

function updatePosition(board, size, x, y, value) {
  return [
    ...board.slice(0, x),
    [...board[x].slice(0, y), value, ...board[x].slice(y + 1, size)],
    ...board.slice(x + 1, size),
  ];
}

function updateBoard({ board, size, x, y }, direction, exits) {
  const [newX, newY] = getNewPosition(x, y, direction);

  let newBoard = updatePosition(board, size, newX, newY, 2);
  // Update neighbours whether path or wall
  ['W', 'N', 'E', 'S'].forEach(d => {
    const [posX, posY] = getNewPosition(newX, newY, d);
    const value = exits.includes(d) ? 1 : 0;
    newBoard = updatePosition(newBoard, size, posX, posY, value);
  });
  return { board: newBoard, x: newX, y: newY };
}

const colorMap = {
  null: '#1e1e1e',
  0: 'grey', // Wall
  1: 'green', // Exits
  2: 'red', // current Position
};

export {
  initBoard,
  createBoard,
  updateBoard,
  getNewPosition,
  getNewDirection,
  colorMap,
};
