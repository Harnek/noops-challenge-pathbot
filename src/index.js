import React from 'react';
import ReactDOM from 'react-dom';
import 'regenerator-runtime/runtime';
import Game from './components/Game';
import './style.css';

function Welcome() {
  return <Game />;
}

ReactDOM.render(<Welcome />, document.getElementById('root'));

module.hot.accept();
