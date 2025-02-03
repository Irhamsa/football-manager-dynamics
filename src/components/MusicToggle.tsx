import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";

export const MusicToggle = () => {
  const [playing, toggle] = useAudio("/background-music.mp3");

  return (
    <button
      onClick={() => toggle()}
      className="fixed bottom-8 right-8 p-4 bg-primary rounded-full shadow-lg hover:scale-110 transition-transform duration-200 ease-in-out"
      aria-label={playing ? "Mute music" : "Play music"}
    >
      {playing ? (
        <Volume2 className="w-6 h-6 text-white" />
      ) : (
        <VolumeX className="w-6 h-6 text-white" />
      )}
    </button>
  );
};