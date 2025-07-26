import { Test, TestingModule } from '@nestjs/testing';
import { TonClientService } from './ton-client.service';

describe('TonClientService', () => {
  let service: TonClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TonClientService],
    }).compile();

    service = module.get<TonClientService>(TonClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
