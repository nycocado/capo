import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { AssemblyListResponseDto } from "@modules/assembly-list/dto";
import { serializeGatewayResponse } from "@common/utils/serialize.gateway";

@WebSocketGateway({ namespace: "assembly-list", cors: true })
export class AssemblyListGateway {
  constructor() {}

  @WebSocketServer() server: Server;

  @OnEvent("assembly-list.create", { async: true })
  handleCreateAssemblyList(assemblyList: AssemblyListEntity) {
    this.server.emit(
      "createAssemblyList",
      serializeGatewayResponse(
        assemblyList,
        AssemblyListResponseDto,
        "assembly-list",
      ),
    );
  }

  @OnEvent("assembly-list.updateWorkStatusToWorking", { async: true })
  @OnEvent("assembly-list.updateWorkStatusToFinished", { async: true })
  handleUpdateWorkStatus(assemblyList: AssemblyListEntity) {
    this.server.emit(
      "updateWorkStatus",
      serializeGatewayResponse(
        assemblyList,
        AssemblyListResponseDto,
        "assembly-list",
      ),
    );
  }
}
