function SpeechSynthesis() {
  const synth = speechSynthesis || webkitSpeechSynthesis;
  const voices = synth.getVoices();
  let utter;

  return {
    speak,
    pause,
    resume,
    cancel,
  };

  function setText(text) {
    utter = new SpeechSynthesisUtterance(text);
    utter.voice = voices[1];
    utter.lang = 'en-US';
    utter.pitch = 1;
    utter.rate = 1;
    utter.volume = 0.7;
  }

  function speak(text) {
    setText(text);
    cancel();
    synth.speak(utter);
    resume();
  }

  function pause() {
    synth.pause();
  }

  function resume() {
    synth.resume();
  }

  function cancel() {
    synth.cancel();
  }
}

export default SpeechSynthesis;
