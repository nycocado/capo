import { Test, TestingModule } from '@nestjs/testing';
import { WelderController } from './welder.controller';
import { WelderService } from './welder.service';

describe('WelderController', () => {
  let controller: WelderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WelderController],
      providers: [WelderService],
    }).compile();

    controller = module.get<WelderController>(WelderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
