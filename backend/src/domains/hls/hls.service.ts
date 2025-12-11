import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HlsService {
  private readonly hlsPath: string;

  constructor(private configService: ConfigService) {
    this.hlsPath = this.configService.get<string>('STORAGE_PATH', '/storage') + '/hls';
  }

  /**
   * Get the directory path for HLS playlist
   */
  getPlaylistPath(): string {
    return this.hlsPath;
  }

  /**
   * Get the directory path for a specific segment
   */
  getSegmentPath(filename: string): string {
    return this.hlsPath;
  }

  /**
   * Get stream information
   */
  async getStreamInfo() {
    const playlistPath = path.join(this.hlsPath, 'index.m3u8');

    if (!fs.existsSync(playlistPath)) {
      return {
        status: 'offline',
        message: 'Playlist not found',
      };
    }

    const segments = fs.readdirSync(this.hlsPath)
      .filter(f => f.endsWith('.ts'))
      .length;

    const playlistContent = fs.readFileSync(playlistPath, 'utf-8');
    const targetDuration = playlistContent.match(/#EXT-X-TARGETDURATION:(\d+)/)?.[1];
    const mediaSequence = playlistContent.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/)?.[1];

    return {
      status: 'online',
      segments,
      targetDuration: targetDuration ? parseInt(targetDuration) : null,
      mediaSequence: mediaSequence ? parseInt(mediaSequence) : null,
      playlistPath: '/api/hls/playlist',
    };
  }
}
