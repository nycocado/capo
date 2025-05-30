import { Test, TestingModule } from '@nestjs/testing';
import { FillerController } from './filler.controller';
import { FillerService } from './filler.service';

describe('FillerController', () => {
  let controller: FillerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FillerController],
      providers: [FillerService],
    }).compile();

    controller = module.get<FillerController>(FillerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
