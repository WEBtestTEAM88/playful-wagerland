import { useEffect } from 'react';

export const useKeyboardControls = (
  onMove: (dx: number, dy: number) => void,
  isPlaying: boolean
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          onMove(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          onMove(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          onMove(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          onMove(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onMove]);
};