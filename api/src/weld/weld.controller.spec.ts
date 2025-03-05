import { Test, TestingModule } from '@nestjs/testing';
import { WeldController } from './weld.controller';
import { WeldService } from './weld.service';

describe('WeldController', () => {
  let controller: WeldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeldController],
      providers: [WeldService],
    }).compile();

    controller = module.get<WeldController>(WeldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
