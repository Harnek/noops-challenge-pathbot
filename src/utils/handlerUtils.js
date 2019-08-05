function KeyboardEventHandler() {
  let handler;
  let flag = true;
  const keyMap = {
    ArrowLeft: 'W',
    ArrowUp: 'N',
    ArrowRight: 'E',
    ArrowDown: 'S',
  };

  return {
    setHandler,
    attachHandler,
    removeHandler,
    pause,
    resume,
  };

  function setHandler(callback) {
    handler = callback;
  }

  function handleEvent(e) {
    if (e.key in keyMap) {
      e.preventDefault();
      if (flag) {
        handler(keyMap[e.key]);
      }
    }
  }

  function pause() {
    flag = false;
  }

  function resume() {
    flag = true;
  }

  function attachHandler() {
    window.addEventListener('keydown', handleEvent);
  }

  function removeHandler() {
    window.removeEventListener('keydown', handleEvent);
  }
}

export default KeyboardEventHandler;
