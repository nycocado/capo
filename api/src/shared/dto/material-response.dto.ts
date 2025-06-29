import { Expose } from 'class-transformer';

export class MaterialResponseDto {
  @Expose()
  name: string;
}
