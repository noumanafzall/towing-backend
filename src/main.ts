import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    enableDebugMessages: true,
    disableErrorMessages: false,
    validationError: {
      target: false,
      value: true
    }
  }));
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global error handling
  app.useGlobalFilters({
    catch(err: unknown, host) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      
      console.log('Error details:', {
        error: err,
        stack: err instanceof Error ? err.stack : undefined,
        type: err instanceof Error ? err.constructor.name : typeof err
      });
      
      const status = err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = err instanceof Error ? err.message : 'Internal server error';
      
      response.status(status).json({ 
        statusCode: status, 
        message,
        timestamp: new Date().toISOString(),
        path: host.switchToHttp().getRequest().url
      });
    },
  });

  await app.listen(3000);
}
bootstrap();