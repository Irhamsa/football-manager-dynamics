import { useState, useEffect } from "react";

export const useAudio = (url: string) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing, audio]);

  useEffect(() => {
    audio.addEventListener("ended", () => audio.play());
    return () => {
      audio.removeEventListener("ended", () => audio.play());
      audio.pause();
    };
  }, [audio]);

  return [playing, toggle] as const;
};