import { ClassConstructor, plainToInstance } from 'class-transformer';
import { wrap } from '@mikro-orm/core';

/**
 * Utility to serialize an entity for WebSocket gateways using class-transformer
 * @param entity - The entity instance (MikroORM)
 * @param dto - The DTO class to transform into
 * @param group - Optional serialization group
 * @returns The serialized DTO object
 */
export function serializeGatewayResponse<T>(
  entity: any,
  dto: ClassConstructor<T>,
  group?: string,
): T {
  // Convert entity to plain object, handling ORM proxies
  const plainData = Array.isArray(entity)
    ? entity.map((e) => wrap(e).toObject())
    : wrap(entity).toObject();
  return plainToInstance(dto, plainData, {
    excludeExtraneousValues: true,
    groups: group ? [group] : undefined,
    enableImplicitConversion: true,
    enableCircularCheck: true,
  });
}
