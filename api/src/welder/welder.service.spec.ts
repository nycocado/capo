import { Test, TestingModule } from '@nestjs/testing';
import { WelderService } from './welder.service';

describe('WelderService', () => {
  let service: WelderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WelderService],
    }).compile();

    service = module.get<WelderService>(WelderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
