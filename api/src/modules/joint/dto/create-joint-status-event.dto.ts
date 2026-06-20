import { IsEnum, IsOptional, IsString } from "class-validator";
import { JointStatus } from "@modules/joint/entities/joint.entity";

export class CreateJointStatusEventDto {
  @IsEnum(JointStatus)
  status!: JointStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
