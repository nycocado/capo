import { Controller } from '@nestjs/common';
import { FittingService } from './fitting.service';

@Controller('fitting')
export class FittingController {
  constructor(private readonly fittingService: FittingService) {}
}
