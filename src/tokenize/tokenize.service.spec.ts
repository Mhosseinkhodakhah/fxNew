import { Test, TestingModule } from '@nestjs/testing';
import { TokenizeService } from './tokenize.service';

describe('TokenizeService', () => {
  let service: TokenizeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TokenizeService],
    }).compile();

    service = module.get<TokenizeService>(TokenizeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
