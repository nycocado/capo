import { Test, TestingModule } from '@nestjs/testing';
import { FillerService } from './filler.service';

describe('FillerService', () => {
  let service: FillerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FillerService],
    }).compile();

    service = module.get<FillerService>(FillerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
