import poems from "@/data/poems";
import AudioControls from "./AudioControls";
import ProgressBar from "@/components/player/ProgressBar";
import { useEffect, useRef, useState } from "react";
import PoemsList from "@/components/player/PoemsList";

function PlayerCard() {
  const audioRef = useRef(null);

  // function handlePlayPause() {
  //   const audio = audioRef.current;

  //   if (!audio) return;

  //   if (audio.paused) {
  //     audio.play();
  //   } else {
  //     audio.pause();
  //   }
  // }

  async function handlePlayPause() {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Impossible de lire le fichier audio :", error);
      }
    } else {
      audio.pause();
    }
  }

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  function handleSeek(time) {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) return;

    audio.currentTime = time;
    setCurrentTime(time);
  }

  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const currentPoem = poems[currentPoemIndex];

  function handleNextPoem() {
    setCurrentPoemIndex((prevIndex) => (prevIndex + 1) % poems.length);
  }

  function handlePreviousPoem() {
    setCurrentPoemIndex(
      (prevIndex) => (prevIndex - 1 + poems.length) % poems.length,
    );
  }

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load();

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [currentPoemIndex]);

  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const [showPoemsList, setShowPoemsList] = useState(false);
  function handleTogglePoemsList() {
    setShowPoemsList((previousValue) => !previousValue);
  }

  return (
    <section className="w-full flex justify-center items-center">
      <article className="w-full max-w-sm mx-auto border rounded-2xl px-4 relative flex flex-col justify-center items-center">
        <div className="card flex flex-col justify-center items-center">
          <h2 className="text-xl my-4">Poeme islamique</h2>
          <img
            src={currentPoem.cover}
            alt={currentPoem.title}
            className="rounded-xl aspect-square object-cover mb-4"
          />
          <h2>{currentPoem.title}</h2>
          <p>{currentPoem.author}</p>
        </div>

        <audio
          ref={audioRef}
          src={currentPoem.src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            setDuration(audioRef.current.duration);
          }}
          onTimeUpdate={() => {
            setCurrentTime(audioRef.current.currentTime);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
        />
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
        <div>
          <AudioControls
            onPlayPause={handlePlayPause}
            isPlaying={isPlaying}
            onNext={handleNextPoem}
            onPrevious={handlePreviousPoem}
            volume={volume}
            onVolumeChange={setVolume}
            onTogglePoemsList={handleTogglePoemsList}
          />

          {showPoemsList && (
            <PoemsList
              poems={poems}
              currentPoemIndex={currentPoemIndex}
              onSelectPoem={(index) => {
                setCurrentPoemIndex(index);
                setShowPoemsList(false);
              }}
              onClose={handleTogglePoemsList}
            />
          )}
        </div>
      </article>
    </section>
  );
}

export default PlayerCard;
