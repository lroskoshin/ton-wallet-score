import { PrismaService } from '@app/shared';
import { TonClient } from '@app/ton-client';
import { Injectable, Logger } from '@nestjs/common';
import { Address } from '@ton/ton';

@Injectable()
export class WalletService {
  private readonly logger: Logger = new Logger(WalletService.name);
  constructor(
    private readonly tonClient: TonClient,
    private readonly prisma: PrismaService,
  ) {}

  async createNewSnapshot(outerAddress: string, timestamp: number) {
    this.logger.log(
      `Creating a new snapshot for address: ${outerAddress} at timestamp: ${timestamp}`,
    );
    const address = Address.parseFriendly(outerAddress);
    const wallet = await this.prisma.wallet.findFirst({
      where: {
        address: outerAddress,
      },
    });
    if (!wallet) {
      this.logger.error('Wallet not found');
      throw new Error('Wallet not found');
    }
    this.logger.log(`Wallet found: ${outerAddress}`);
    const snapshot = await this.prisma.snapshot.findFirst({
      where: {
        walletId: outerAddress,
        timestamp: {
          equals: new Date(timestamp),
        },
      },
    });
    if (snapshot) {
      this.logger.error('Snapshot already exists');
      throw new Error('Snapshot already exists');
    }
    this.logger.log(`Getting contract state for address: ${outerAddress}`);
    const tonWallet = await this.tonClient.getBalance(address.address);

    this.logger.log(`Contract state: ${tonWallet}`);
    const tonCoin = await this.prisma.coin.findFirst({
      where: {
        name: 'TON',
      },
    });
    if (!tonCoin) {
      this.logger.error('TON coin not found');
      throw new Error('TON coin not found');
    }
    // TODO: get balance of jettons
    try {
      await this.prisma.snapshot.create({
        data: {
          walletId: wallet.id,
          timestamp: new Date(timestamp),
          balances: {
            create: [{ coinId: tonCoin.id, amount: tonWallet }],
          },
        },
        include: {
          balances: true,
        },
      });
    } catch (error) {
      this.logger.error('Error creating snapshot', error);
      throw new Error('Error creating snapshot');
    }
    this.logger.log('New snapshot created successfully');
  }
}
