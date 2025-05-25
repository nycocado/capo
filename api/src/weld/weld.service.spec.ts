import { Test, TestingModule } from '@nestjs/testing';
import { WeldService } from './weld.service';

describe('WeldService', () => {
  let service: WeldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeldService],
    }).compile();

    service = module.get<WeldService>(WeldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
