import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { WorkStatusResponseDto } from "@shared/dto";
import { WpsResponseDto } from "@modules/wps/dto";
import { FillerMaterialResponseDto } from "@modules/filler-material/dto";

export class WeldResponseDto {
  @Expose()
  id: number;

  @Expose()
  number: string;

  @Expose({ groups: ["weld", "joint", "weld-list"] })
  @Type(() => FillerMaterialResponseDto)
  fillerMaterial?: FillerMaterialResponseDto;

  @Expose({ groups: ["weld", "joint", "weld-list"] })
  @Type(() => WpsResponseDto)
  wps?: WpsResponseDto;

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
