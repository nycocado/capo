import { Test, TestingModule } from '@nestjs/testing';
import { PipeFitterService } from './pipe-fitter.service';

describe('PipeFitterService', () => {
  let service: PipeFitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipeFitterService],
    }).compile();

    service = module.get<PipeFitterService>(PipeFitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
