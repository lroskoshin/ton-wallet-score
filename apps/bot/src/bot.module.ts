import { Module } from '@nestjs/common';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { Env, EnvModule, PrismaModule } from '@app/shared';

@Module({
  imports: [
    EnvModule,
    PrismaModule,
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        token: configService.get('BOT_TOKEN', { infer: true })!,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
