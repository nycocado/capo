import { ClassConstructor } from "class-transformer";
import { applyDecorators, UseInterceptors } from "@nestjs/common";
import { SerializeInterceptor } from "@common/interceptors";

export function SerializeResponse<T>(dto: ClassConstructor<T>, group?: string) {
  return applyDecorators(
    UseInterceptors(new SerializeInterceptor({ dto, group })),
  );
}
