import { Expose, plainToInstance, Transform } from "class-transformer";
import { PipeLengthResponseDto } from "@modules/pipe-length/dto";
import { FittingResponseDto } from "@modules/fitting/dto";
import { SpoolResponseDto } from "@shared/dto/spool-response.dto";
import { buildDocumentUrl } from "@common/utils/url-builder";

export class SheetResponseDto {
  @Expose()
  id: number;

  @Expose()
  number: number;

  @Expose({ groups: ["assembly-list"] })
  @Transform(({ obj }) => {
    const revisions = obj.revisions;
    if (!revisions || revisions.length === 0) return undefined;
    const lastRevision = revisions[revisions.length - 1];
    return buildDocumentUrl(lastRevision.document, "rev");
  })
  document?: string;

  @Expose({ groups: ["cut-list", "assembly-list"] })
  @Transform(({ obj, options }) => {
    const revisions = obj.revisions;
    if (!revisions || revisions.length === 0) return [];
    const lastRevision = revisions[revisions.length - 1];
    const lengths: any[] = [];
    lastRevision.spools?.forEach((spool: any) => {
      spool.joints?.forEach((joint: any) => {
        if (joint.part1?.pipeLength) lengths.push(joint.part1.pipeLength);
        if (joint.part2?.pipeLength) lengths.push(joint.part2.pipeLength);
      });
    });
    return plainToInstance(PipeLengthResponseDto, lengths, {
      ...options,
    });
  })
  pipeLengths?: PipeLengthResponseDto[];

  @Expose({ groups: ["assembly-list"] })
  @Transform(({ obj, options }) => {
    const revisions = obj.revisions;
    if (!revisions || revisions.length === 0) return [];
    const lastRevision = revisions[revisions.length - 1];
    const fittings: any[] = [];
    lastRevision.spools?.forEach((spool: any) => {
      spool.joints?.forEach((joint: any) => {
        if (joint.part1?.fitting) fittings.push(joint.part1.fitting);
        if (joint.part2?.fitting) fittings.push(joint.part2.fitting);
      });
    });
    return plainToInstance(FittingResponseDto, fittings, {
      ...options,
    });
  })
  fittings?: FittingResponseDto[];

  @Expose({ groups: ["assembly-list", "weld-list"] })
  @Transform(({ obj, options }) => {
    const revisions = obj.revisions;
    if (!revisions || revisions.length === 0) return [];
    const lastRevision = revisions[revisions.length - 1];
    const spools = lastRevision.spools;
    if (!spools || spools.length === 0) return [];
    return plainToInstance(SpoolResponseDto, lastRevision.spools, {
      ...options,
    });
  })
  spools?: SpoolResponseDto[];
}
