import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import {
  DiameterResponseDto,
  MaterialResponseDto,
  WorkStatusResponseDto,
} from "@shared/dto";

export class PipeLengthResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.part?.id)
  id: number;

  @Expose()
  @Transform(({ obj }) => obj.part?.number)
  number: string;

  @Expose()
  internalId: string;

  @Expose()
  description: string;

  @Expose()
  length: number;

  @Expose()
  thickness: number;

  @Expose()
  @Transform(({ value }) => value ?? null)
  heatNumber: string | null;

  @Expose()
  @Type(() => MaterialResponseDto)
  material: MaterialResponseDto;

  @Expose()
  @Type(() => DiameterResponseDto)
  diameter: DiameterResponseDto;

  @Expose()
  @Transform(({ obj, options }) => {
    const statuses = obj.part?.workStatuses;
    if (!statuses || statuses.length === 0) return undefined;
    return plainToInstance(
      WorkStatusResponseDto,
      statuses[statuses.length - 1],
      { ...options },
    );
  })
  workStatus?: WorkStatusResponseDto;
}
