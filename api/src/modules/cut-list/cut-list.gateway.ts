import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { CutListService } from '@modules/cut-list/cut-list.service';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { CutListEntity } from '@modules/cut-list/entities';
import { plainToInstance } from 'class-transformer';
import { CutListResponseDto } from '@modules/cut-list/dto';

@WebSocketGateway({ namespace: 'cut-list', cors: true })
export class CutListGateway {
  constructor(private readonly cutListService: CutListService) {}

  @WebSocketServer() server: Server;

  @OnEvent('cut-list.updateWorkStatusToFinished', { async: true })
  @OnEvent('cut-list.updateWorkStatusToWorking', { async: true })
  handleUpdateWorkStatus(cutList: CutListEntity) {
    const response = plainToInstance(CutListResponseDto, cutList, {
      excludeExtraneousValues: true,
    });
    this.server.emit('updateWorkStatus', { response });
  }
}
