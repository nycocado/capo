import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RoleEntity } from './entity/role.entity';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOne(id: number) {
    return this.databaseService.user.findUnique({
      where: { id },
      omit: { password: true },
    });
  }

  async getRoles(id: number): Promise<RoleEntity[]> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      include: {
        cuttingOperators: true,
        pipeFitters: true,
        welders: true,
        admins: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    const roles: RoleEntity[] = [];
    if (user.cuttingOperators.length)
      roles.push(new RoleEntity('cutting-operator', 'Cutting Operator'));
    if (user.pipeFitters.length)
      roles.push(new RoleEntity('pipe-fitter', 'Pipe Fitter'));
    if (user.welders.length) roles.push(new RoleEntity('welder', 'Welder'));
    if (user.admins.length) roles.push(new RoleEntity('admin', 'Admin'));
    return roles;
  }

  async getProfile(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      omit: { password: true, birthDate: true, id: true, internalId: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
