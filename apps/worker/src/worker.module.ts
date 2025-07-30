import { Env, EnvModule, PrismaModule } from '@app/shared';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { WalletScoreProcessor } from './wallet-score.processor';

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
    BullModule.registerQueue({
      name: 'wallet-score',
    }),
    ...(process.env.BULL_DASHBOARD === 'true'
      ? [
          BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
          }),
          BullBoardModule.forFeature({
            name: 'wallet-score',
            adapter: BullMQAdapter,
          }),
        ]
      : []),
  ],
  providers: [WalletScoreProcessor],
})
export class WorkerModule {}
