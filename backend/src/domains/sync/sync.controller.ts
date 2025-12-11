/**
 * Sync Controller
 * HTTP endpoints for timestamp synchronization
 */

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncRequestDto, SyncResultDto } from './sync.dto';

@Controller('sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly syncService: SyncService) {}

  /**
   * POST /api/sync
   * Synchronize playback to game clock
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(@Body() request: SyncRequestDto): Promise<SyncResultDto> {
    // Validate request
    if (!request.clock) {
      throw new BadRequestException('Clock parameter is required');
    }

    // Validate clock format (basic check)
    const clockRegex = /^\d{1,2}:\d{2}$/;
    if (!clockRegex.test(request.clock)) {
      throw new BadRequestException('Invalid clock format. Expected MM:SS or M:SS');
    }

    this.logger.log(`Sync request received: ${JSON.stringify(request)}`);

    try {
      const result = await this.syncService.sync(request);
      return result;
    } catch (error) {
      this.logger.error('Sync request failed', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Sync processing failed');
    }
  }

  /**
   * GET /api/sync/live-edge
   * Get current live edge timestamp
   */
  @Post('live-edge')
  @HttpCode(HttpStatus.OK)
  async getLiveEdge() {
    const liveEdge = await this.syncService.getLiveEdge();

    if (liveEdge === null) {
      return {
        success: false,
        error: 'No segments available',
      };
    }

    return {
      success: true,
      timestamp: liveEdge,
    };
  }

  /**
   * POST /api/sync/health
   * Health check
   */
  @Post('health')
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'sync-api',
      timestamp: new Date().toISOString(),
    };
  }
}
