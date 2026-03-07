/**
 * BRÜCKEN BAUEN 3D – Audio-Engine
 * Spielgeräusche und Hintergrundmusik via Howler.js
 * (Graceful Fallback wenn Howler nicht verfügbar)
 */
'use strict';

const AudioEngine = (() => {
  let enabled = CONFIG.AUDIO_ENABLED;
  const sounds = {};

  function init() {
    if (typeof Howl === 'undefined') {
      console.info('Howler.js nicht verfügbar – Audio deaktiviert');
      enabled = false;
      return;
    }
    // Sounds werden bei Bedarf geladen (lazy)
  }

  function play(name) {
    if (!enabled) return;
    if (sounds[name]) sounds[name].play();
  }

  function playSuccess() {
    _playTone([523, 659, 784], [0.1, 0.1, 0.3]);
  }

  function playFail() {
    _playTone([300, 250], [0.15, 0.3]);
  }

  function playClick() {
    _playTone([800], [0.05]);
  }

  function playLevelUp() {
    _playTone([523, 659, 784, 1047], [0.1, 0.1, 0.1, 0.4]);
  }

  function _playTone(freqs, durations) {
    if (!enabled || typeof AudioContext === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      let time = ctx.currentTime;
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);
        osc.start(time);
        osc.stop(time + durations[i]);
        time += durations[i] * 0.8;
      });
    } catch (e) { /* Ignorieren */ }
  }

  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  return { init, play, playSuccess, playFail, playClick, playLevelUp, toggle };
})();
