'use client';

import { useEffect, useRef, RefObject } from 'react';
import Hls from 'hls.js';

interface UseHlsOptions {
  playlistUrl: string;
  autoPlay?: boolean;
}

export function useHls(
  audioRef: RefObject<HTMLAudioElement>,
  options: UseHlsOptions
) {
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        // Low-latency configuration
        lowLatencyMode: true,
        backBufferLength: 10,
        maxBufferLength: 10,
        maxMaxBufferLength: 15,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5,
        enableWorker: true,
        startLevel: -1,
        debug: false,
      });

      hls.loadSource(options.playlistUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✓ HLS manifest parsed');
        if (options.autoPlay) {
          audio.play().catch((error) => {
            console.warn('Autoplay failed:', error);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, destroying HLS...');
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
