import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the AppConfigService instance from the app context
  // This demonstrates that AppConfigService is available globally due to ConfigModule setup
  const appConfigService = app.get(AppConfigService);
  const port = appConfigService.get('port');
  const env = appConfigService.get('environment');

  app.setGlobalPrefix('api'); // Set a global API prefix
  

  // await app.listen(process.env.PORT ?? 3000);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${env}, Port: ${port}`);
}
bootstrap();
