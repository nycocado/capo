import { Test, TestingModule } from '@nestjs/testing';
import { RevService } from './rev.service';

describe('RevService', () => {
  let service: RevService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevService],
    }).compile();

    service = module.get<RevService>(RevService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
