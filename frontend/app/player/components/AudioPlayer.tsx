'use client';

import { useRef, RefObject, useImperativeHandle, forwardRef } from 'react';
import { useHls } from '../hooks/useHls';
import { usePlayer } from '../hooks/usePlayer';

interface AudioPlayerProps {
  playlistUrl: string;
  audioRef?: RefObject<HTMLAudioElement | null>;
  playerRef?: RefObject<AudioPlayerHandle>;
}

export interface AudioPlayerHandle {
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  ({ playlistUrl, audioRef: externalAudioRef }, ref) => {
    const internalAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioRef = externalAudioRef || internalAudioRef;

    // Initialize HLS
    useHls(audioRef, {
      playlistUrl,
      autoPlay: false,
    });

    // Player controls
    const { isPlaying, currentTime, togglePlay, seekBy, seek } = usePlayer(audioRef);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      seekTo: (time: number) => {
        seek(time);
      },
      play: () => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.play().catch(console.error);
        }
      },
      pause: () => {
        if (audioRef.current && isPlaying) {
          audioRef.current.pause();
        }
      },
    }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Player UI */}
      <div className="space-y-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Live Audio Stream</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Low-latency HLS playback
          </p>
        </div>

        {/* Time Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Current Time</div>
        </div>

        {/* Play/Pause Button */}
        <div className="flex justify-center">
          <button
            onClick={togglePlay}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-lg transition-colors flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6"
                  />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-6.518-3.772A1 1 0 007 8.27v7.46a1 1 0 001.234.972l6.518-3.772a1 1 0 000-1.732z"
                  />
                </svg>
                Play
              </>
            )}
          </button>
        </div>

        {/* Seek Controls */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => seekBy(-10)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            -10s
          </button>
          <button
            onClick={() => seekBy(-1.5)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            -1.5s
          </button>
          <button
            onClick={() => seekBy(1.5)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            +1.5s
          </button>
          <button
            onClick={() => seekBy(10)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            +10s
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          {isPlaying ? 'Playing' : 'Paused'}
        </div>
      </div>
    </div>
  );
});

AudioPlayer.displayName = 'AudioPlayer';
