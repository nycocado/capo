import { ClassConstructor, plainToInstance } from 'class-transformer';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { wrap } from '@mikro-orm/core';

interface SerializeOptions<T> {
  dto: ClassConstructor<T>;
  group?: string;
}

@Injectable()
export class SerializeInterceptor<T> implements NestInterceptor<any, T> {
  constructor(private options: SerializeOptions<T>) {}

  intercept(context: ExecutionContext, handler: CallHandler): Observable<T> {
    return handler.handle().pipe(
      map((data: any): T => {
        let plainData: any;
        if (Array.isArray(data)) {
          plainData = data.map((item) => wrap(item).toObject());
        } else if (data && typeof data === 'object') {
          plainData = wrap(data).toObject();
        } else {
          plainData = data;
        }
        return plainToInstance(this.options.dto, plainData, {
          groups: this.options.group ? [this.options.group] : undefined,
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
          enableCircularCheck: true,
        });
      }),
    );
  }
}
