import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ 
    transform: true, 
    whitelist: true,
    transformOptions: {
      enableImplicitConversion: true,
    }
  }));
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalFilters({
    catch(err: unknown, host) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = err instanceof Error ? err.message : 'Internal server error';
      console.error(err);
      response.status(status).json({ statusCode: status, message });
    },
  });
  await app.listen(3000);
}
bootstrap();