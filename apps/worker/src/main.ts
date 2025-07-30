import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  await app.listen(process.env.WORKER_PORT ?? 3001);
  console.log(`🚀 Bot on ${await app.getUrl()}`);
}
bootstrap();
