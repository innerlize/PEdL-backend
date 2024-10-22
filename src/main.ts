import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('PEdL API')
    .setDescription(
      'A highly scalable and maintainable API for managing various resources, with secure admin user authentication and a comprehensive set of features for efficient content management.',
    )
    .addBearerAuth({
      type: 'http',
      description:
        'Authorization header using the Bearer scheme, followed by a JWT token signed by Firebase. You <strong>don&apos;t need to include</strong> the "Bearer" prefix, just the token. <br/><br/> <strong>Example:</strong> <br/> Bearer {token}<strong> <br/><br/>',
    })
    .setVersion('1.0')
    .build();

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const apiDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, apiDocument);

  await app.listen(3808);
}

bootstrap();
