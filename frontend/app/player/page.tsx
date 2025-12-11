'use client';

import { useRef, useState } from 'react';
import { AudioPlayer, AudioPlayerHandle } from './components/AudioPlayer';
import { SyncModal } from './components/SyncModal';
import Link from 'next/link';

export default function PlayerPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const playlistUrl = `${API_URL}/api/hls/playlist`;

  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<AudioPlayerHandle>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncedTimestamp, setSyncedTimestamp] = useState<number | null>(null);

  const handleSyncComplete = (timestamp: number) => {
    // Seek audio to the synced timestamp
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp);
    }
    setSyncedTimestamp(timestamp);
    setSyncModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="mb-8 w-full max-w-2xl flex justify-between items-center">
        <Link
          href="/"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          ← Back to Home
        </Link>

        <button
          onClick={() => setSyncModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Sync with Scoreboard
        </button>
      </div>

      <AudioPlayer ref={playerRef} playlistUrl={playlistUrl} audioRef={audioRef} />

      {syncedTimestamp !== null && (
        <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 max-w-2xl w-full animate-fadeIn">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-green-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">
              Synced to {Math.floor(syncedTimestamp / 60)}:
              {Math.floor(syncedTimestamp % 60)
                .toString()
                .padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      <div className="mt-12 max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
          <h3 className="font-semibold mb-3">Player Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>✓ Low-latency HLS playback (&lt;6 seconds)</li>
            <li>✓ Play/Pause controls</li>
            <li>✓ Seek backward: -1.5s and -10s</li>
            <li>✓ Seek forward: +1.5s and +10s</li>
            <li>✓ Real-time playback indicator</li>
            <li className="text-green-600 dark:text-green-400 font-medium">
              ✓ OCR synchronization (NEW!)
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>How to sync:</strong> Click "Sync with Scoreboard" and upload a screenshot showing
              the game clock and score. The OCR system will detect the time and sync your playback
              automatically.
            </p>
          </div>
        </div>
      </div>

      <SyncModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onSyncComplete={handleSyncComplete}
      />
    </div>
  );
}
