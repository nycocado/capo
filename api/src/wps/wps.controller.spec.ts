import { Test, TestingModule } from '@nestjs/testing';
import { WpsController } from './wps.controller';
import { WpsService } from './wps.service';

describe('WpsController', () => {
  let controller: WpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WpsController],
      providers: [WpsService],
    }).compile();

    controller = module.get<WpsController>(WpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
