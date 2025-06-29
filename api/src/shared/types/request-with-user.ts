import { Request } from 'express';
import { UserEntity } from '@modules/user/entities';

export type RequestWithUser = Request & { user: UserEntity };
