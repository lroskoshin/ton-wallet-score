import { PrismaService } from '@app/shared';
import { Processor } from '@nestjs/bullmq';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { WalletService } from './wallet.service';
import { Logger } from '@nestjs/common';

@Processor('wallet-score')
export class WalletScoreProcessor extends WorkerHost {
  private readonly logger: Logger = new Logger(WalletScoreProcessor.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {
    super();
  }

  async process(job: Job<{ address: string }>) {
    const { address } = job.data;

    const wallet = await this.prisma.wallet.findUnique({
      where: {
        address,
      },
    });

    if (!wallet) {
      await this.prisma.wallet.upsert({
        where: {
          address,
        },
        create: {
          address,
          roi: 0,
          volatility: 0,
        },
        update: {
          address,
          roi: 0,
          volatility: 0,
        },
      });
    }

    try {
      await this.walletService.createNewSnapshot(address, Date.now());
    } catch (error) {
      this.logger.error('Error creating new snapshot', error);
      throw new Error('Error creating new snapshot');
    }
  }
}
