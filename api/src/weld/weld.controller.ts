import { Controller } from '@nestjs/common';
import { WeldService } from './weld.service';

@Controller('weld')
export class WeldController {
  constructor(private readonly weldService: WeldService) {}
}
