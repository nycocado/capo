import { Test, TestingModule } from '@nestjs/testing';
import { JointService } from './joint.service';

describe('JointService', () => {
  let service: JointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JointService],
    }).compile();

    service = module.get<JointService>(JointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
