import { createBoard } from './boardUtils';

const API_ROOT = 'https://api.noopschallenge.com';
const cache = createBoard(100);

/**
 *
 * @param {String} path
 * @param {Object} body {direction: 'X'} where X = W, N, E or S
 * @param {Number} x Position in row
 * @param {Number} y Position in col
 */
async function postJson(path, body, x, y) {
  if (cache[x][y]) {
    return Promise.resolve(cache[x][y]);
  }
  const res = await fetch(API_ROOT + path, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  cache[x][y] = data;
  return data;
}

export default postJson;
