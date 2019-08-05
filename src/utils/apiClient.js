import fetch from 'node-fetch';

const API_ROOT = 'https://api.noopschallenge.com';

function getJson(path) {
  return fetch(API_ROOT + path, {
    method: 'get',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  }).then(res => res.json());
}

function postJson(path, body) {
  return fetch(API_ROOT + path, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(res => res.json());
}

export { getJson, postJson };
