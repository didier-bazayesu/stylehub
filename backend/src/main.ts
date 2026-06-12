import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters';
import { TransformResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const logger = new Logger('Bootstrap');

  // ── Global prefix ───────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Security ────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cookieParser());

  // ── CORS ────────────────────────────────────────────────────────
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: frontendUrl.split(',').map((url) => url.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global Pipes ────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Global Filters ──────────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global Interceptors ─────────────────────────────────────────
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // ── Swagger Documentation ───────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('StyleHub API')
    .setDescription('Multi-Vendor Fashion Marketplace API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ── Start ───────────────────────────────────────────────────────
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 StyleHub API running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
