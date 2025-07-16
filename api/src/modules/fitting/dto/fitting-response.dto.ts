import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import {
  MaterialResponseDto,
  PortResponseDto,
  WorkStatusResponseDto,
} from "@shared/dto";
import { FittingTypeResponseDto } from "@modules/fitting/dto/fitting-type-response.dto";

export class FittingResponseDto {
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
  @Type(() => FittingTypeResponseDto)
  fittingType: FittingTypeResponseDto;

  @Expose()
  @Type(() => PortResponseDto)
  ports?: PortResponseDto[];

  @Expose()
  @Transform(({ obj, options }) => {
    const workStatuses = obj.part?.workStatuses;
    if (!workStatuses || workStatuses.length === 0) return undefined;
    return plainToInstance(WorkStatusResponseDto, workStatuses[0], {
      ...options,
    });
  })
  workStatus?: WorkStatusResponseDto;
}
