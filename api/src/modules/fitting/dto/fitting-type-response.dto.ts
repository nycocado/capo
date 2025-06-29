import { Expose } from 'class-transformer';

export class FittingTypeResponseDto {
  @Expose()
  name: string;
}
