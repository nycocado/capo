import { Test, TestingModule } from '@nestjs/testing';
import { RevController } from './rev.controller';
import { RevService } from './rev.service';

describe('RevController', () => {
  let controller: RevController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RevController],
      providers: [RevService],
    }).compile();

    controller = module.get<RevController>(RevController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
