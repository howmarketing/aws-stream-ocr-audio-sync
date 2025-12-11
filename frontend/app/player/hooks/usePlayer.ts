'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';

interface UsePlayerReturn {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  seek: (time: number) => void;
  seekBy: (offset: number) => void;
}

export function usePlayer(
  audioRef: RefObject<HTMLAudioElement>
): UsePlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioRef]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((error) => {
        console.error('Play failed:', error);
      });
    }
  }, [audioRef, isPlaying]);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0));
    },
    [audioRef]
  );

  const seekBy = useCallback(
    (offset: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      const newTime = audio.currentTime + offset;
      seek(newTime);
    },
    [audioRef, seek]
  );

  return {
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    seekBy,
  };
}
