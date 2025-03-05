import { Test, TestingModule } from '@nestjs/testing';
import { JointController } from './joint.controller';
import { JointService } from './joint.service';

describe('JointController', () => {
  let controller: JointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JointController],
      providers: [JointService],
    }).compile();

    controller = module.get<JointController>(JointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
