import { Expose, Transform } from 'class-transformer';

export class WorkStatusResponseDto {
  @Expose()
  @Transform(({ obj }) => obj.workStatusType?.name)
  name: string;

  @Expose()
  @Transform(({ value }) => value ?? null)
  notes: string | null;

  @Expose()
  @Transform(({ obj }) => obj.createdBy?.id ?? null)
  createdBy: number | null;
}
