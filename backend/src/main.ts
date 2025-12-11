import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  // Register multipart plugin for file uploads
  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  console.log('========================================');
  console.log('🚀 Audio Sync Backend API');
  console.log('========================================');
  console.log(`📡 Server: http://localhost:${port}/api`);
  console.log(`🏥 Health: http://localhost:${port}/api/health`);
  console.log(`🎵 HLS: http://localhost:${port}/api/hls/playlist`);
  console.log(`📊 Index: http://localhost:${port}/api/index/segments`);
  console.log(`🔍 OCR: http://localhost:${port}/api/ocr/upload`);
  console.log('========================================\n');
}

bootstrap();
