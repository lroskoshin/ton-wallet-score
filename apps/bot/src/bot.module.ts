import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { Env, EnvModule, PrismaModule } from '@app/shared';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    EnvModule,
    PrismaModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        connection: {
          url: configService.get('REDIS_URL', { infer: true })!,
        },
      }),
      inject: [ConfigService],
    }),
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        token: configService.get('BOT_TOKEN', { infer: true })!,
        options: {
          telegram: {
            testEnv:
              configService.get('TELEGRAM_ENV', { infer: true }) !==
              'production',
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [BotUpdate],
})
export class BotModule {}
