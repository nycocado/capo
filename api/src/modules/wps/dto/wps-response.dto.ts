import { Expose, Transform } from "class-transformer";
import { buildDocumentUrl } from "@common/utils/url-builder";

export class WpsResponseDto {
  @Expose()
  internalId: string;

  @Expose()
  @Transform(({ value }) => buildDocumentUrl(value, "wps"))
  document: string;

  @Expose()
  tpi: number;
}
