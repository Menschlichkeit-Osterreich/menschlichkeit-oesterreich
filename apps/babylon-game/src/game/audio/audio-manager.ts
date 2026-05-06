import { Sound, type Scene } from '@babylonjs/core';

function safePlay(sound: Sound | null) {
  if (!sound) {
    return;
  }
  try {
    if (sound.isPlaying) {
      sound.stop();
    }
    sound.play();
  } catch {
    // Audio is optional and should never break gameplay.
  }
}

export function createAudioManager(scene: Scene) {
  let muted = false;

  const ambient = new Sound('ambient-loop', '/audio/ambient-community.mp3', scene, undefined, {
    loop: true,
    autoplay: false,
    volume: 0.3,
  });
  const collect = new Sound('collect-sfx', '/audio/collect.mp3', scene, undefined, {
    loop: false,
    autoplay: false,
    volume: 0.45,
  });
  const success = new Sound('success-sfx', '/audio/success.mp3', scene, undefined, {
    loop: false,
    autoplay: false,
    volume: 0.5,
  });
  const fail = new Sound('fail-sfx', '/audio/fail.mp3', scene, undefined, {
    loop: false,
    autoplay: false,
    volume: 0.45,
  });

  const setMuteState = (nextMuted: boolean) => {
    muted = nextMuted;
    const volume = muted ? 0 : 1;
    ambient.setVolume(0.3 * volume);
    collect.setVolume(0.45 * volume);
    success.setVolume(0.5 * volume);
    fail.setVolume(0.45 * volume);
  };

  setMuteState(false);

  return {
    setMuted(nextMuted: boolean) {
      setMuteState(nextMuted);
    },
    isMuted() {
      return muted;
    },
    playAmbient() {
      if (muted || ambient.isPlaying) {
        return;
      }
      safePlay(ambient);
    },
    stopAmbient() {
      if (ambient.isPlaying) {
        ambient.stop();
      }
    },
    playCollect() {
      if (muted) {
        return;
      }
      safePlay(collect);
    },
    playSuccess() {
      if (muted) {
        return;
      }
      safePlay(success);
    },
    playFail() {
      if (muted) {
        return;
      }
      safePlay(fail);
    },
    dispose() {
      ambient.dispose();
      collect.dispose();
      success.dispose();
      fail.dispose();
    },
  };
}
