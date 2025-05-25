import { Test, TestingModule } from '@nestjs/testing';
import { CuttingOperatorController } from './cutting-operator.controller';
import { CuttingOperatorService } from './cutting-operator.service';

describe('CuttingOperatorController', () => {
  let controller: CuttingOperatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuttingOperatorController],
      providers: [CuttingOperatorService],
    }).compile();

    controller = module.get<CuttingOperatorController>(CuttingOperatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
