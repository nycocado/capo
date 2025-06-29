import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { AssemblyListService } from '@modules/assembly-list/assembly-list.service';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { AssemblyListEntity } from '@modules/assembly-list/entities';
import { plainToInstance } from 'class-transformer';
import { AssemblyListResponseDto } from '@modules/assembly-list/dto';

@WebSocketGateway({ namespace: 'assembly-list', cors: true })
export class AssemblyListGateway {
  constructor(private readonly assemblyListService: AssemblyListService) {}

  @WebSocketServer() server: Server;

  @OnEvent('assembly-list.create', { async: true })
  handleCreateAssemblyList(assemblyList: AssemblyListEntity) {
    const response = plainToInstance(AssemblyListResponseDto, assemblyList, {
      excludeExtraneousValues: true,
    });
    this.server.emit('createAssemblyList', { response });
  }

  @OnEvent('assembly-list.updateWorkStatusToWorking', { async: true })
  @OnEvent('assembly-list.updateWorkStatusToFinished', { async: true })
  handleUpdateWorkStatus(assemblyList: AssemblyListEntity) {
    const response = plainToInstance(AssemblyListResponseDto, assemblyList, {
      excludeExtraneousValues: true,
    });
    this.server.emit('updateWorkStatus', { response });
  }
}
