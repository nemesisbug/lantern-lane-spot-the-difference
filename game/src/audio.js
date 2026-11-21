// All sound is synthesised with WebAudio: no audio files, no network, and
// nothing to load. A found difference chimes, a miss thuds, a cleared round
// plays a little arpeggio, and the last ten seconds tick.

export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      try {
        context = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, at, dur, type, gain) {
    const audio = ensure();
    if (!audio || muted) return;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0, audio.currentTime + at);
    amp.gain.linearRampToValueAtTime(gain, audio.currentTime + at + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(audio.currentTime + at);
    osc.stop(audio.currentTime + at + dur + 0.05);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    unlock() {
      ensure();
    },
    found() {
      tone(659, 0, 0.16, 'sine', 0.22);
      tone(880, 0.09, 0.24, 'sine', 0.22);
    },
    miss() {
      tone(140, 0, 0.22, 'square', 0.12);
    },
    hint() {
      tone(523, 0, 0.12, 'triangle', 0.15);
      tone(784, 0.08, 0.16, 'triangle', 0.15);
    },
    clear() {
      [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.11, 0.3, 'sine', 0.2));
    },
    over() {
      [392, 330, 262].forEach((freq, i) => tone(freq, i * 0.16, 0.3, 'triangle', 0.16));
    },
    tick() {
      tone(1200, 0, 0.05, 'sine', 0.08);
    },
  };
}
