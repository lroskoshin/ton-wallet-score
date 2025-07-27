import { NestFactory } from '@nestjs/core';
import { BotModule } from './bot.module';

async function bootstrap() {
  const app = await NestFactory.create(BotModule);
  await app.listen(process.env.BOT_PORT ?? 3000);
  console.log(`🚀 Bot on ${await app.getUrl()}`);
}
bootstrap();
