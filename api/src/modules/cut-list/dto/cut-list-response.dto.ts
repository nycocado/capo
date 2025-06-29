import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { IsometricResponseDto } from '@shared/dto/isometric-response.dto';
import { WorkStatusResponseDto } from '@shared/dto';

export class CutListResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose()
  @Type(() => IsometricResponseDto)
  isometric: IsometricResponseDto;

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
