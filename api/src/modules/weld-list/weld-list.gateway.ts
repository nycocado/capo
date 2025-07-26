import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListResponseDto } from "@modules/weld-list/dto";
import { serializeGatewayResponse } from "@common/utils/serialize.gateway";

@WebSocketGateway({ namespace: "weld-list", cors: true })
export class WeldListGateway {
  constructor() {}

  @WebSocketServer() server: Server;

  @OnEvent("weld-list.creates", { async: true })
  handleWeldListCreates(weldList: WeldListEntity[]) {
    this.server.emit(
      "createsWeldList",
      serializeGatewayResponse(weldList, WeldListResponseDto, "weld-list"),
    );
  }

  @OnEvent("weld-list.updateWorkStatusToWorking", { async: true })
  @OnEvent("weld-list.updateWorkStatusToFinished", { async: true })
  handleUpdateWorkStatus(weldList: WeldListEntity) {
    this.server.emit(
      "updateWorkStatus",
      serializeGatewayResponse(weldList, WeldListResponseDto, "weld-list"),
    );
  }
}
