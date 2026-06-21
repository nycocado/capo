import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { wrap } from "@mikro-orm/core";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { createWsAuthMiddleware, stageGatewayCors } from "@common/ws";

@WebSocketGateway({
  namespace: "assembly-list",
  cors: stageGatewayCors,
})
export class AssemblyListGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server): void {
    server.use(createWsAuthMiddleware(this.jwtService));
  }

  emitClaimChanged(id: number): void {
    this.server.emit("claimChanged", { id });
  }

  emitStatusChanged(joint: JointEntity): void {
    this.server.emit("statusChanged", wrap(joint).toObject());
  }

  emitUpstream(): void {
    this.server.emit("statusChanged", { upstream: true });
  }
}
