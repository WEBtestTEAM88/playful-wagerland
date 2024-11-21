let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
};

const playAudioWithVolume = async (url: string, volume: number) => {
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
};

export const playWinSound = (volume = 1) => {
  playAudioWithVolume('/sounds/win.mp3', volume);
};

export const playLoseSound = (volume = 1) => {
  playAudioWithVolume('/sounds/lose.mp3', volume);
};

export const playSpinSound = (volume = 1) => {
  playAudioWithVolume('/sounds/spin.mp3', volume);
};