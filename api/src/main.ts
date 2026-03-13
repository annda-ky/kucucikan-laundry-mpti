/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

// Pisahkan logika setup agar bisa dipakai di local maupun Vercel
async function setupApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Laundry Management API 2026')
    .setDescription('Dokumentasi lengkap API POS Laundry sesuai FR')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Swagger akan tersedia di /docs
  SwaggerModule.setup('docs', app, document);
}

// Untuk Local Development
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await setupApp(app);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Export untuk Vercel Serverless
export default async (req: any, res: any) => {
  const app = await NestFactory.create(AppModule);
  await setupApp(app);
  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  instance(req, res);
};
