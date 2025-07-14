import { WeldDto } from '@/dtos';

export interface WeldWithContext extends WeldDto {
  spool: {
    internalId: string;
  };
}
