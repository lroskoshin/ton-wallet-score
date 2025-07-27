// apps/bot/src/bot.update.ts
import { Update, Start, Command, Ctx, Message, Sender } from 'nestjs-telegraf';
import { bold, fmt } from 'telegraf/format';
import { PrismaService } from '@app/shared';
import { Context } from './interfaces/context.interface';

@Update()
export class BotUpdate {
  constructor(private readonly prisma: PrismaService) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Hi! Send /score <TON-address>');
  }

  @Command('score')
  async score(
    @Ctx() ctx: Context,
    @Message('text') text: string,
    @Sender('id') userId: number,
  ): Promise<void> {
    const [, address] = text.split(/\s+/);
    if (!address) {
      await ctx.reply('Usage: /score <ton-address>');
      return;
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: { address },
    });

    if (!wallet) {
      await ctx.reply(
        fmt`🔍 ${bold(address.slice(0, 6))}…${bold(
          address.slice(-4),
        )}\nScore is not available yet, but will be soon ⏳`,
        { parse_mode: 'HTML' },
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
