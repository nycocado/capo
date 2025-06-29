import { Expose } from 'class-transformer';

export class ProjectResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose()
  name: string;

  @Expose()
  client: string;
}
