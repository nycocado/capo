import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { SpoolResponseDto } from "@shared/dto/spool-response.dto";
import { WorkStatusResponseDto } from "@shared/dto";

export class WeldListResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose()
  @Type(() => SpoolResponseDto)
  spool: SpoolResponseDto;

  @Expose()
  @Transform(({ obj, options }) => {
    const statuses = obj.workStatuses;
    if (!statuses || statuses.length === 0) return undefined;
    return plainToInstance(
      WorkStatusResponseDto,
      statuses[statuses.length - 1],
      { ...options },
    );
  })
  workStatus?: WorkStatusResponseDto;
}
