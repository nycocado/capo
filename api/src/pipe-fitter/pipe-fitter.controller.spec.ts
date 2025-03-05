import { Test, TestingModule } from '@nestjs/testing';
import { PipeFitterController } from './pipe-fitter.controller';
import { PipeFitterService } from './pipe-fitter.service';

describe('PipeFitterController', () => {
  let controller: PipeFitterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipeFitterController],
      providers: [PipeFitterService],
    }).compile();

    controller = module.get<PipeFitterController>(PipeFitterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
