import { Expose, plainToInstance, Transform } from 'class-transformer';
import { IsometricResponseDto } from '@shared/dto/isometric-response.dto';
import { WorkStatusResponseDto } from '@shared/dto';

export class AssemblyListResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose()
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
