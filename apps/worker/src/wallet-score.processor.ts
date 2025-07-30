import { PrismaService } from '@app/shared';
import { Processor } from '@nestjs/bullmq';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('wallet-score')
export class WalletScoreProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
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
      await this.prisma.wallet.create({
        data: {
          address,
          roi: 0,
          volatility: 0,
        },
      });
    }

    console.log(`Processing wallet score for address: ${address}`);
  }
}
