/**
 * Sync Module
 */

import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { ClockNormalizerService } from './clock-normalizer.service';
import { TimestampSearcherService } from './timestamp-searcher.service';
import { ConfidenceCalculatorService } from './confidence-calculator.service';
import { IndexModule } from '../index/index.module';

@Module({
  imports: [IndexModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    ClockNormalizerService,
    TimestampSearcherService,
    ConfidenceCalculatorService,
  ],
  exports: [SyncService],
})
export class SyncModule {}
