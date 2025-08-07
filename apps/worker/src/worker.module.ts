import { Env, EnvModule } from '@app/shared';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@bull-board/express';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    EnvModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        connection: {
          url: configService.get('REDIS_URL', { infer: true })!,
        },
      }),
      inject: [ConfigService],
    }),
    ...(process.env.BULL_DASHBOARD === 'true'
      ? [
          BullBoardModule.forRoot({
            route: '/queues',
            adapter: ExpressAdapter,
          }),
        ]
      : []),
    WalletModule,
  ],
})
export class WorkerModule {}
