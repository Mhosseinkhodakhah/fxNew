import { Test, TestingModule } from '@nestjs/testing';
import { InterserviceService } from './interservice.service';

describe('InterserviceService', () => {
  let service: InterserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterserviceService],
    }).compile();

    service = module.get<InterserviceService>(InterserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
