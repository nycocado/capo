import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WeldListService } from '@modules/weld-list/weld-list.service';
import { Server } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';
import { WeldListEntity } from '@modules/weld-list/entities';
import { plainToInstance } from 'class-transformer';
import { WeldListResponseDto } from '@modules/weld-list/dto';

@WebSocketGateway({ namespace: 'weld-list', cors: true })
export class WeldListGateway {
  constructor(private readonly weldListService: WeldListService) {}

  @WebSocketServer() server: Server;

  @OnEvent('weld-list.creates', { async: true })
  handleWeldListCreates(weldList: WeldListEntity[]) {
    const response = plainToInstance(WeldListResponseDto, weldList, {
      excludeExtraneousValues: true,
    });
    this.server.emit('weldListCreates', { response });
  }

  @OnEvent('weld-list.updateWorkStatusToWorking', { async: true })
  @OnEvent('weld-list.updateWorkStatusToFinished', { async: true })
  handleUpdateWorkStatus(weldList: WeldListEntity) {
    const response = plainToInstance(WeldListResponseDto, weldList, {
      excludeExtraneousValues: true,
    });
    this.server.emit('updateWorkStatus', { response });
  }
}
