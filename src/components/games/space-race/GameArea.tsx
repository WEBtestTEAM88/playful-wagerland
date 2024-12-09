import { Star, Rocket } from "lucide-react";

interface GameAreaProps {
  progress: number;
  position: number;
  obstacles: Array<{ x: number; y: number }>;
  isRacing: boolean;
}

export const GameArea = ({ progress, position, obstacles, isRacing }: GameAreaProps) => {
  return (
    <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
      {/* Progress track */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-blue-900/20"
        style={{ transform: `translateY(${100 - progress}%)` }}
      />
      
      {/* Obstacles */}
      {obstacles.map((obstacle, index) => (
        <div
          key={index}
          className="absolute w-4 h-4 text-yellow-500"
          style={{
            left: `${obstacle.x}%`,
            top: `${100 - obstacle.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Star className="animate-pulse" />
        </div>
      ))}
      
      {/* Player rocket */}
      <div
        className="absolute bottom-0 w-8 h-8 text-casino-gold transition-all duration-100"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
          bottom: `${progress}%`
        }}
      >
        <Rocket className={`${isRacing ? 'animate-bounce' : ''}`} />
      </div>
    </div>
  );
};