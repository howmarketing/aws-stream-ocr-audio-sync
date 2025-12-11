import { AudioPlayer } from './components/AudioPlayer';
import Link from 'next/link';

export default function PlayerPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const playlistUrl = `${API_URL}/api/hls/playlist`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <AudioPlayer playlistUrl={playlistUrl} />

      <div className="mt-12 max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
          <h3 className="font-semibold mb-3">Player Features:</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>✓ Low-latency HLS playback (&lt;6 seconds)</li>
            <li>✓ Play/Pause controls</li>
            <li>✓ Seek backward: -1.5s and -10s</li>
            <li>✓ Seek forward: +1.5s and +10s</li>
            <li>✓ Real-time playback indicator</li>
            <li>⏳ OCR synchronization (coming soon)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
