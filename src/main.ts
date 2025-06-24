import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { ValidationPipe, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable API Versioning
  // Choose your strategy here:
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',

    // type: VersioningType.HEADER, 
    // header: 'X-API-Version', 

    // defaultVersion: '1',
    defaultVersion: VERSION_NEUTRAL
  });

  // Enable CORS
  app.enableCors();

  // Global Validation Pipe (from previous session)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true
    }
  }));

  // Get the AppConfigService instance from the app context
  // This demonstrates that AppConfigService is available globally due to ConfigModule setup
  const appConfigService = app.get(AppConfigService);
  const port = appConfigService.get('port');
  const env = appConfigService.get('environment');

  app.setGlobalPrefix('api'); // Set a global API prefix


  // SWAGGER SETUP STARTS HERE
  const config = new DocumentBuilder()
    .setTitle('Nest Js E-commerce Backend API')
    .setDescription('API documentation for the E-commerce Backend application.')
    .setVersion('1.0') // API Version
    .addTag('users', 'Operations related to user accounts')
    .addTag('categories', 'Operations related to product categories')
    .addBearerAuth( // Add Bearer token authentication scheme
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT Bearer token',
        in: 'header',
      },
      'access-token' // This name is used in @ApiSecurity() decorator
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-api', app, document); // 'api' is the URL path for your Swagger UI (e.g., http://localhost:3000/swagger-api)
  // SWAGGER SETUP ENDS HERE

  // await app.listen(process.env.PORT ?? 3000);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${env}, Port: ${port}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/swagger-api`);
}
bootstrap();
