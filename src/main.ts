import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  // 로거 설정
  const app = await NestFactory.create(AppModule, {
    logger: isProduction
      ? ['error', 'warn'] // Production: 에러와 경고만
      : ['log', 'error', 'warn', 'debug', 'verbose'], // Development: 모든 로그
  });

  // CORS 설정
  app.enableCors({
    origin: isProduction
      ? process.env.ALLOWED_ORIGINS?.split(',') || [] // Production: 환경변수에서 허용 도메인 읽기
      : true, // Development: 요청 origin을 그대로 허용
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger는 개발 환경에서만 활성화
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Cat Town API')
      .setDescription('Cat Town 서버 API 문서')
      .setVersion('1.0')
      .addTag('cats')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);

  // 서버 시작 로그
  console.log(`🚀 Server is running on: http://localhost:${process.env.PORT ?? 3000}`);
  if (!isProduction) {
    console.log(`📚 Swagger is running on: http://localhost:${process.env.PORT ?? 3000}/docs`);
  }
}
bootstrap();
