import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('PEdL API')
    .setDescription(
      'A highly scalable and maintainable API for managing various resources, with secure admin user authentication and a comprehensive set of features for efficient content management.',
    )
    .setVersion('1.0')
    .build();

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const apiDocument = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, apiDocument);

  await app.listen(3808);
}

bootstrap();
