import { Test, TestingModule } from '@nestjs/testing';
import { CuttingOperatorService } from './cutting-operator.service';

describe('CuttingOperatorService', () => {
  let service: CuttingOperatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuttingOperatorService],
    }).compile();

    service = module.get<CuttingOperatorService>(CuttingOperatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
