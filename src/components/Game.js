/* eslint-disable react/button-has-type */
/* eslint-disable react/no-array-index-key */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState, useRef, Fragment } from 'react';
import { postJson } from '../utils/apiClient';
import {
  initBoard,
  createBoard,
  updateBoard,
  getNewPosition,
  colorMap,
} from '../utils/boardUtils';
import KeyboardEventHandler from '../utils/handlerUtils';
import SpeechSynthesis from '../utils/speechUtils';
import Solver from '../utils/solverUtils';

function Game() {
  const [game, setGame] = useState(initBoard(100));
  const locationCache = useRef(createBoard(100));
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

  const [zoom, setZoom] = useState(15);
  const zoomInput = useRef(null);

  const inputHandler = useRef(new KeyboardEventHandler());
  const synth = useRef(new SpeechSynthesis());
  const isImmersive = useRef(false);

  useEffect(() => {
    fetchAndUpdate('/pathbot/start', {});
    solver.current.initSolver(100, handleKeyboardEvent);
    inputHandler.current.pause();
    inputHandler.current.setHandler(handleKeyboardEvent);
    inputHandler.current.attachHandler();

    return () => {
      inputHandler.current.removeHandler();
    };
  }, []);

  function fetchAndUpdate(url, body) {
    isUpdating.current = true;
    const [newX, newY] = getNewPosition(game.x, game.y, nextDirection.current);

    // if already in location_cache
    if (locationCache.current[newX][newY] !== null) {
      location.current = { ...locationCache.current[newX][newY] };
      const { exits } = location.current;
      setGame(() => updateBoard(game, nextDirection.current, exits));
    } else {
      postJson(url, body).then(res => {
        if (!isCancelled.current) {
          location.current = res;
          locationCache.current[newX][newY] = { ...location.current };
          if (location.current.status === 'finished') {
            inputHandler.current.removeHandler();
            isOver.current = true;
          } else {
            const { exits } = location.current;
            setGame(() => updateBoard(game, nextDirection.current, exits));
          }
        }
      });
    }
  }

  function handleKeyboardEvent(direction) {
    if (!useSolver.current) {
      didUserMove.current = true;
    }
    inputHandler.current.pause();
    nextDirection.current = direction;

    const { exits } = location.current;
    if (!exits.includes(nextDirection.current)) {
      if (isImmersive.current) {
        synth.current.setText('There is a wall in that direction');
        synth.current.speak();
      }
      inputHandler.current.resume();
    } else {
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
      solver.current.solve(
        game.x,
        game.y,
        location.current.exits,
        location.current.mazeExitDirection,
        location.current.mazeExitDistance,
      );
      return;
    }

    if (isImmersive.current) {
      synth.current.setText(location.current.description);
      synth.current.speak();
    }

    inputHandler.current.resume();
  }, [game, zoom]);

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
                .slice(Math.max(0, game.x - zoom), Math.min(game.x + zoom, 100))
                .map(row => (
                  <tr>
                    {row
                      .slice(
                        Math.max(0, game.y - zoom),
                        Math.min(game.y + zoom, 100),
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
              ref={zoomInput}
              type="range"
              min="10"
              max="30"
              step="10"
              value={zoom}
              onChange={() => {
                setZoom(() => Number(zoomInput.current.value));
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
          <div>Exits :{location.current.exits.join(',')}</div>
          <div>Maze exit direction : {location.current.mazeExitDirection}</div>
          <div>Maze exit distance : {location.current.mazeExitDistance}</div>
          <div>Hint: Use Array keys to navigate</div>
        </Fragment>
      )}
    </div>
  );
}

export default Game;
