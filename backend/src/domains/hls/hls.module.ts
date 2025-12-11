import { Module } from '@nestjs/common';
import { HlsController } from './hls.controller';
import { HlsService } from './hls.service';

@Module({
  controllers: [HlsController],
  providers: [HlsService],
  exports: [HlsService],
})
export class HlsModule {}
