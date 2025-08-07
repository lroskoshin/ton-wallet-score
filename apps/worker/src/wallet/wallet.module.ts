import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { WalletScoreProcessor } from './wallet-score.processor';
import { WalletService } from './wallet.service';
import { TonClientModule } from '@app/ton-client';
import { PrismaModule } from '@app/shared';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'wallet-score',
    }),
    TonClientModule,
    ...(process.env.BULL_DASHBOARD === 'true'
      ? [
          BullBoardModule.forFeature({
            name: 'wallet-score',
            adapter: BullMQAdapter,
          }),
        ]
      : []),
  ],
  providers: [WalletScoreProcessor, WalletService],
})
export class WalletModule {}
