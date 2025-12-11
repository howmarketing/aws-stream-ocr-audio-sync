import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { IndexService } from './index.service';

@Controller('index')
export class IndexController {
  constructor(private readonly indexService: IndexService) {}

  /**
   * GET /api/index/segments
   * Returns recent segments with optional limit
   */
  @Get('segments')
  async getSegments(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.indexService.getRecentSegments(limitNum);
  }

  /**
   * GET /api/index/segments/:sequence
   * Returns a specific segment by sequence number
   */
  @Get('segments/:sequence')
  async getSegmentBySequence(@Param('sequence', ParseIntPipe) sequence: number) {
    return this.indexService.getSegmentBySequence(sequence);
  }

  /**
   * GET /api/index/find-by-time
   * Find the closest segment for a given timestamp
   */
  @Get('find-by-time')
  async findByTime(@Query('timestamp') timestamp: string) {
    const time = parseFloat(timestamp);
    if (isNaN(time)) {
      return { error: 'Invalid timestamp' };
    }
    return this.indexService.findSegmentByTime(time);
  }

  /**
   * GET /api/index/stats
   * Returns database statistics
   */
  @Get('stats')
  async getStats() {
    return this.indexService.getStats();
  }
}
