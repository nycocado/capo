import { Test, TestingModule } from '@nestjs/testing';
import { PipeLengthController } from './pipe-length.controller';
import { PipeLengthService } from './pipe-length.service';

describe('PipeLengthController', () => {
  let controller: PipeLengthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipeLengthController],
      providers: [PipeLengthService],
    }).compile();

    controller = module.get<PipeLengthController>(PipeLengthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
