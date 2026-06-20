import { Request } from "express";
import { UserEntity } from "@modules/user/entities/user.entity";

export type RequestWithUser = Request & { user: UserEntity };
