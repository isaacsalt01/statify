import React, { useRef, useEffect, useState, useCallback } from "react";
import { use } from "react";

const AudioPlayer = ({ url, isPlaying, onPlay, onPause, onEnded, onError }) => {
  const audioRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  // Handle URL changes - stop current audio and prepare for new one
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !url) return;

    // Only handle URL changes when the URL actually changes
    if (currentUrl !== url) {
      setCurrentUrl(url);

      // Pause any currently playing audio
      if (isPlaying) {
        audio.pause();
      }

      // Reset the audio element to ensure clean state
      audio.currentTime = 0;
      audio.load();

      // If we should be playing, start the new audio
      if (isPlaying) {
        audio.play().catch((error) => {
          console.error("Audio play error:", error);
          onError?.(error);
        });
      }
    }
  }, [url, currentUrl, isPlaying, onError]);

  useEffect(() => {
    if (!isPlaying) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useCallback(() => {
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => onEnded?.();
    const handleError = (error) => onError?.(error);

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [onEnded, onError]);

  return (
    <audio
      ref={audioRef}
      src={url}
      preload="metadata"
      style={{ display: "none" }}
    />
  );
};

export default AudioPlayer;
