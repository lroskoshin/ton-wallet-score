import { Env, EnvModule } from '@app/shared';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    BullModule.registerQueue({
      name: 'wallet-score',
    }),
  ],
  controllers: [],
  providers: [],
})
export class WorkerModule {}
