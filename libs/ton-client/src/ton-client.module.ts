import { Module } from '@nestjs/common';
import { TonClientService } from './ton-client.service';

@Module({
  providers: [TonClientService],
  exports: [TonClientService],
})
export class TonClientModule {}
