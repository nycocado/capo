import { WeldDto } from "@/dtos";

export interface WeldWithContext extends WeldDto {
  spoolInfo: {
    internalId: string;
  };
}
