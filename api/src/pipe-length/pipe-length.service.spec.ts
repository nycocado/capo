import { Test, TestingModule } from '@nestjs/testing';
import { PipeLengthService } from './pipe-length.service';

describe('PipeLengthService', () => {
  let service: PipeLengthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipeLengthService],
    }).compile();

    service = module.get<PipeLengthService>(PipeLengthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
