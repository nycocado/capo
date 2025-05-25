import { Controller } from '@nestjs/common';
import { JointService } from './joint.service';

@Controller('joint')
export class JointController {
  constructor(private readonly jointService: JointService) {}
}
