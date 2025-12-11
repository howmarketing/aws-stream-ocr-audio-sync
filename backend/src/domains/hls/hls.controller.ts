import { Controller, Get, Param, Res, HttpStatus, NotFoundException } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HlsService } from './hls.service';

@Controller('hls')
export class HlsController {
  constructor(private readonly hlsService: HlsService) {}

  /**
   * GET /api/hls/playlist
   * Returns the HLS playlist (index.m3u8)
   */
  @Get('playlist')
  async getPlaylist(@Res() reply: FastifyReply) {
    try {
      const playlistPath = this.hlsService.getPlaylistPath();

      return reply
        .code(HttpStatus.OK)
        .header('Content-Type', 'application/vnd.apple.mpegurl')
        .header('Cache-Control', 'no-cache, no-store, must-revalidate')
        .header('Pragma', 'no-cache')
        .header('Expires', '0')
        .sendFile('index.m3u8', playlistPath);
    } catch (error) {
      throw new NotFoundException('Playlist not found');
    }
  }

  /**
   * GET /api/hls/segments/:filename
   * Returns an HLS segment file
   */
  @Get('segments/:filename')
  async getSegment(
    @Param('filename') filename: string,
    @Res() reply: FastifyReply,
  ) {
    // Security: Only allow .ts files
    if (!filename.endsWith('.ts') || filename.includes('..')) {
      throw new NotFoundException('Invalid segment file');
    }

    try {
      const segmentPath = this.hlsService.getSegmentPath(filename);

      return reply
        .code(HttpStatus.OK)
        .header('Content-Type', 'video/mp2t')
        .header('Cache-Control', 'public, max-age=2')
        .header('Access-Control-Allow-Origin', '*')
        .sendFile(filename, segmentPath);
    } catch (error) {
      throw new NotFoundException(`Segment ${filename} not found`);
    }
  }

  /**
   * GET /api/hls/info
   * Returns metadata about the HLS stream
   */
  @Get('info')
  async getInfo() {
    return this.hlsService.getStreamInfo();
  }
}
