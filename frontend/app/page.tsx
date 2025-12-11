import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center max-w-2xl">
        <h1 className="text-4xl font-bold text-center">
          🎧 Audio Sync Platform
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400">
          Low-latency audio streaming with scoreboard synchronization
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            href="/player"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Open Player
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Low Latency</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &lt;6 second latency with 2s HLS segments
            </p>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Live Streaming</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              FFmpeg-powered audio ingestion and packaging
            </p>
          </div>

          <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h3 className="font-semibold mb-2">Sync Engine</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              OCR-based scoreboard synchronization
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
