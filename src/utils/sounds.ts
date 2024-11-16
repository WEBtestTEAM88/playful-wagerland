export const playWinSound = () => {
  const audio = new Audio('/sounds/win.mp3');
  audio.play();
};

export const playLoseSound = () => {
  const audio = new Audio('/sounds/lose.mp3');
  audio.play();
};

export const playSpinSound = () => {
  const audio = new Audio('/sounds/spin.mp3');
  audio.play();
};