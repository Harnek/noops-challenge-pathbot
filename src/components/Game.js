/* eslint-disable react/button-has-type */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState, useRef, Fragment } from 'react';
import postJson from '../utils/apiClient';
import {
  initBoard,
  updateBoard,
  getNewPosition,
  colorMap,
} from '../utils/boardUtils';
import KeyboardEventHandler from '../utils/handlerUtils';
import SpeechSynthesis from '../utils/speechUtils';
import Solver from '../utils/solverUtils';

function Game() {
  const [game, setGame] = useState(initBoard(100));
  const location = useRef({
    description: null,
    exits: [],
    locationPath: null,
    mazeExitDirection: null,
    mazeExitDistance: null,
    message: null,
    status: null,
  });
  const nextDirection = useRef(null);
  const [updateFlag, setUpdateFlag] = useState(false);
  const isUpdating = useRef(false);
  const isCancelled = useRef(false);
  const isOver = useRef(false);

  const solver = useRef(new Solver());
  const useSolver = useRef(false);
  const didUserMove = useRef(false);

  const zoom = useRef(15);
  const zoomInput = useRef(null);

  const inputHandler = useRef(new KeyboardEventHandler());
  const synth = useRef(new SpeechSynthesis());
  const isImmersive = useRef(false);

  useEffect(() => {
    fetchAndUpdate('/pathbot/start', {});
    solver.current.initSolver(100, handleKeyboardEvent);
    inputHandler.current.pause();
    inputHandler.current.attachHandler(handleKeyboardEvent);

    return () => {
      inputHandler.current.removeHandler();
    };
  }, []);

  async function fetchAndUpdate(url, body) {
    isUpdating.current = true;

    const [newX, newY] = getNewPosition(game.x, game.y, nextDirection.current);
    const data = await postJson(url, body, newX, newY);

    if (!isCancelled.current) {
      location.current = data;

      if (location.current.status === 'finished') {
        if (isImmersive.current) {
          synth.current.speak(location.current.description);
        }
        inputHandler.current.removeHandler();
        isOver.current = true;
        isUpdating.current = false;
        setUpdateFlag(prevValue => !prevValue);
      } else {
        const { exits } = location.current;
        setGame(() => updateBoard(game, nextDirection.current, exits));
      }
    }
  }

  function handleKeyboardEvent(direction) {
    if (!useSolver.current) {
      // messes up dfs solver if user moves
      didUserMove.current = true;
    }
    inputHandler.current.pause();

    const { exits } = location.current;
    const directionNames = { W: 'West', N: 'North', E: 'East', S: 'South' };
    if (!exits.includes(direction)) {
      if (isImmersive.current) {
        synth.current.speak(
          `There is a wall in ${directionNames[direction]} direction.`,
        );
      }
      inputHandler.current.resume();
    } else {
      nextDirection.current = direction;
      setUpdateFlag(prevValue => !prevValue);
    }
  }

  useEffect(() => {
    isCancelled.current = false;
    if (!isUpdating.current && !isOver.current) {
      const url = location.current.locationPath;
      const body = { direction: nextDirection.current };
      fetchAndUpdate(url, body);
    }

    return () => {
      isCancelled.current = true;
    };
  }, [updateFlag]);

  useEffect(() => {
    nextDirection.current = null;
    synth.current.cancel();
    isUpdating.current = false;

    if (isOver.current) {
      return;
    }

    if (useSolver.current) {
      if (didUserMove.current) {
        solver.current.initSolver(100, handleKeyboardEvent);
        didUserMove.current = false;
      }
      const { x, y } = game;
      const { exits, mazeExitDirection, mazeExitDistance } = location.current;
      solver.current.solve(x, y, exits, mazeExitDirection, mazeExitDistance);
      return;
    }

    if (isImmersive.current) {
      synth.current.speak(location.current.description);
    }

    inputHandler.current.resume();
  }, [game]);

  if (location.current.status === null) {
    return <div>Loading</div>;
  }

  return (
    <div id="game">
      {!isOver.current && (
        <div id="options">
          <button
            onClick={() => {
              isImmersive.current = !isImmersive.current;
              setUpdateFlag(prevValue => !prevValue);
            }}
          >
            {isImmersive.current ? 'Switch to GUI' : 'Switch to Immersive'}
          </button>
          <button
            onClick={() => {
              useSolver.current = !useSolver.current;
              setUpdateFlag(prevValue => !prevValue);
            }}
          >
            {useSolver.current ? 'Cancel' : 'Solve'}
          </button>
        </div>
      )}
      {!isImmersive.current && (
        <Fragment>
          <table>
            <tbody>
              {game.board
                .slice(
                  Math.max(0, game.x - zoom.current),
                  Math.min(game.x + zoom.current, 100),
                )
                .map(row => (
                  <tr>
                    {row
                      .slice(
                        Math.max(0, game.y - zoom.current),
                        Math.min(game.y + zoom.current, 100),
                      )
                      .map(col => (
                        <td style={{ backgroundColor: colorMap[col] }} />
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
          <div id="zoom">
            <input
              className="slider"
              ref={zoomInput}
              type="range"
              min="10"
              max="25"
              step="5"
              value={zoom.current}
              onChange={() => {
                zoom.current = Number(zoomInput.current.value);
                if (!isUpdating.current) {
                  setUpdateFlag(prevValue => !prevValue);
                }
              }}
            />
          </div>
        </Fragment>
      )}

      {isOver.current ? (
        <div
          style={{
            color: 'red',
            minHeight: '1rem',
            textAlign: 'center',
          }}
        >
          {location.current.description}
        </div>
      ) : (
        <Fragment>
          <div>Description : {location.current.description}</div>
          <div>Exits : {location.current.exits.join(',')}</div>
          <div>Maze exit direction : {location.current.mazeExitDirection}</div>
          <div>Maze exit distance : {location.current.mazeExitDistance}</div>
          <div>Hint: Use Array keys to navigate</div>
        </Fragment>
      )}
    </div>
  );
}

export default Game;
