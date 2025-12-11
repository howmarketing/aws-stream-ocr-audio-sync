'use client';

import { useEffect, useRef, RefObject } from 'react';
import Hls from 'hls.js';

interface UseHlsOptions {
  playlistUrl: string;
  autoPlay?: boolean;
}

export function useHls(
  audioRef: RefObject<HTMLAudioElement | null>,
  options: UseHlsOptions
) {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        // Disable low-latency mode to allow seeking away from live edge
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 120,
        maxMaxBufferLength: 180,
        // Allow seeking far from live edge (300 segments * 2s = 600s = 10 min)
        liveSyncDurationCount: 300,
        liveMaxLatencyDurationCount: 300,
        enableWorker: true,
        startLevel: -1,
        debug: false,
        // Force start from live edge
        startPosition: -1,
        // Handle segment gaps gracefully
        maxFragLookUpTolerance: 0.1,
        // Retry configuration for missing segments
        fragLoadingMaxRetry: 2,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 2,
      });

      hls.loadSource(options.playlistUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✓ HLS manifest parsed');
        // Start from the live edge
        hls.startLoad(-1);
        if (options.autoPlay) {
          audio.play().catch((error) => {
            console.warn('Autoplay failed:', error);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        // Handle non-fatal fragment load errors (404s for old segments)
        if (data.details === 'fragLoadError' && !data.fatal) {
          console.warn('Segment load failed (likely aged out), skipping...');
          return;
        }

        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error, trying to recover...');
              hls.startLoad(-1); // Restart from live edge
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Unrecoverable error, destroying HLS...');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      audio.src = options.playlistUrl;
      if (options.autoPlay) {
        audio.play().catch((error) => {
          console.warn('Autoplay failed:', error);
        });
      }
    }
  }, [audioRef, options.playlistUrl, options.autoPlay]);

  return hlsRef;
}
