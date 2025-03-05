import { Test, TestingModule } from '@nestjs/testing';
import { WpsService } from './wps.service';

describe('WpsService', () => {
  let service: WpsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WpsService],
    }).compile();

    service = module.get<WpsService>(WpsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
