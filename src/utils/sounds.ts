let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const playAudioWithVolume = async (url: string, volume: number) => {
  try {
    const context = getAudioContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    const source = context.createBufferSource();
    const gainNode = context.createGain();
    
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(context.destination);
    
    gainNode.gain.value = volume;
    source.start(0);
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

let currentVolume = 1;

export const setGlobalVolume = (volume: number) => {
  currentVolume = volume;
};

export const playWinSound = () => {
  playAudioWithVolume('/sounds/win.mp3', currentVolume);
};

export const playLoseSound = () => {
  playAudioWithVolume('/sounds/lose.mp3', currentVolume);
};

export const playSpinSound = () => {
  playAudioWithVolume('/sounds/spin.mp3', currentVolume);
};