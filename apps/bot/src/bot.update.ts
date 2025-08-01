// apps/bot/src/bot.update.ts
import {
  Update,
  Start,
  Command,
  Ctx,
  Message,
  Sender,
  InjectBot,
} from 'nestjs-telegraf';
import { bold, fmt } from 'telegraf/format';
import { PrismaService } from '@app/shared';
import { Context } from './interfaces/context.interface';
import { Address } from '@ton/ton';
import { Telegraf } from 'telegraf';
import { OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Update()
export class BotUpdate implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    @InjectBot() private readonly bot: Telegraf<Context>,
    @InjectQueue('wallet-score') private readonly walletScoreQueue: Queue,
  ) {}

  onModuleInit() {
    this.bot.telegram.setMyCommands([
      { command: 'start', description: 'Start the bot' },
      {
        command: 'score',
        description: 'Get wallet score analysis, usage: /score <ton-address>',
      },
    ]);
  }

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply(
      fmt`👋 Hi! Send /score &lt;TON-address&gt; to get wallet analysis\n\n⚠️ This is a naive implementation and the bot is under development`,
      { parse_mode: 'HTML' },
    );
  }

  @Command('score')
  async score(
    @Ctx() ctx: Context,
    @Message('text') text: string,
    @Sender('id') userId: number,
  ): Promise<void> {
    const address = text.split(/\s+/)[1].trim();

    if (!address) {
      await ctx.reply(
        fmt`Usage: /score &lt;ton-address&gt;` +
          `friendly or raw format, example: /score UQBYEumAtLN43rfeJgkDT3803xq_CtVGlUjovVLJe3QaHlmg`,
        { parse_mode: 'HTML' },
      );
      return;
    }

    if (!Address.isFriendly(address) && !Address.isRaw(address)) {
      await ctx.reply(
        '🤔 Invalid address, please try again with a valid TON address',
      );
      return;
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { address },
    });

    if (!wallet) {
      await ctx.reply(
        fmt`🔍 ${bold(address.slice(0, 6))}…${bold(
          address.slice(-4),
        )}\n\n📊 Score is not available yet, but will be soon ⏳`,
        { parse_mode: 'HTML' },
      );
      const waitingCount = await this.walletScoreQueue.getWaitingCount();
      if (waitingCount > 1000) {
        await ctx.reply(
          fmt`🔍 ${bold(address.slice(0, 6))}…${bold(address.slice(-4))}\n\n📊 Score is not available yet, and queue is full ⏳`,
          { parse_mode: 'HTML' },
        );
        return;
      }

      await this.walletScoreQueue.add(
        'calculate',
        { address },
        {
          jobId: `wallet-score-calculate-${address}`,
        },
      );
      return;
    }

    const risk = Math.min(5, Math.floor(wallet.volatility * 20));
    await ctx.reply(
      fmt`📊 ${bold(address.slice(0, 6))}…${bold(address.slice(-4))}\n` +
        `ROI: ${bold((wallet.roi * 100).toFixed(2))}%\n` +
        `Risk: ${'🔴'.repeat(risk)}`,
      { parse_mode: 'HTML' },
    );
  }
}
