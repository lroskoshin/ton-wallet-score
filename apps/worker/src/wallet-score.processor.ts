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
    console.log(address);
  }
}
