import { PipeLengthResponseDto } from "@modules/pipe-length/dto";
import { FittingResponseDto } from "@modules/fitting/dto";
import { WeldResponseDto } from "@modules/weld/dto";
import { WorkStatusResponseDto } from "@shared/dto";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";

export class JointResponseDto {
  @Expose()
  id: number;

  @Expose({ groups: ["joint"] })
  @Transform(({ obj, options }) => {
    return obj.part2?.pipeLength
      ? plainToInstance(PipeLengthResponseDto, obj.part1.pipeLength, {
          ...options,
        })
      : plainToInstance(FittingResponseDto, obj.part1.fitting, {
          ...options,
        });
  })
  part1: PipeLengthResponseDto | FittingResponseDto;

  @Expose({ groups: ["joint"] })
  @Transform(({ obj, options }) => {
    return obj.part2?.pipeLength
      ? plainToInstance(PipeLengthResponseDto, obj.part1.pipeLength, {
          ...options,
        })
      : plainToInstance(FittingResponseDto, obj.part1.fitting, {
          ...options,
        });
  })
  part2: PipeLengthResponseDto | FittingResponseDto;

  @Expose()
  @Type(() => WeldResponseDto)
  welds?: WeldResponseDto[];

  @Expose()
  @Type(() => WorkStatusResponseDto)
  @Transform(({ obj, options }) => {
    const statuses = obj.workStatuses;
    if (!statuses || statuses.length === 0) return undefined;
    return plainToInstance(
      WorkStatusResponseDto,
      statuses[statuses.length - 1],
      { ...options },
    );
  })
  @Type(() => WorkStatusResponseDto)
  workStatus?: WorkStatusResponseDto;
}
