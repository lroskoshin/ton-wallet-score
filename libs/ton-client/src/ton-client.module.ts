import { Env } from '@app/shared';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TonClient } from '@ton/ton';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TonClient,
      useFactory: (configService: ConfigService<Env>) =>
        new TonClient({
          endpoint: configService.get('TON_ENDPOINT', { infer: true })!,
          apiKey: configService.get('TONCENTER_KEY', { infer: true }),
        }),
      inject: [ConfigService],
    },
  ],
  exports: [TonClient],
})
export class TonClientModule {}
