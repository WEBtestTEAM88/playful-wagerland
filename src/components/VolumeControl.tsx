import { Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useVolume } from "@/contexts/VolumeContext";
import { setGlobalVolume } from "@/utils/sounds";

export function VolumeControl() {
  const { volume, setVolume } = useVolume();

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setGlobalVolume(newVolume);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-casino-black/80 p-2 rounded-lg">
      <Volume2 className="h-4 w-4 text-casino-gold" />
      <Slider
        className="w-24"
        defaultValue={[volume * 100]}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
      />
    </div>
  );
}