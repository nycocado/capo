import { Expose, plainToInstance, Transform, Type } from 'class-transformer';
import { JointResponseDto } from '@modules/joint/dto';
import { WeldResponseDto } from '@modules/weld/dto';

export class SpoolResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose({ groups: ['assembly-list'] })
  @Type(() => JointResponseDto)
  joints?: JointResponseDto[];

  @Expose({ groups: ['weld-list'] })
  @Type(() => WeldResponseDto)
  @Transform(({ obj, options }) => {
    const welds = obj.joints?.flatMap((joint: any) => joint.welds);
    if (!welds || welds.length === 0) return undefined;
    return plainToInstance(WeldResponseDto, welds, {
      ...options,
    });
  })
  welds?: WeldResponseDto[];
}
