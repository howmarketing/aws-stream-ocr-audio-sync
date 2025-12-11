import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HlsModule } from './domains/hls/hls.module';
import { IndexModule } from './domains/index/index.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HlsModule,
    IndexModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
