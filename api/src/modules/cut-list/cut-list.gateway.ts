import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { OnEvent } from "@nestjs/event-emitter";
import { wrap } from "@mikro-orm/core";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { createWsAuthMiddleware } from "@common/ws";

@WebSocketGateway({
  namespace: "cut-list",
  cors: { origin: process.env.CORS_ORIGIN ?? false, credentials: true },
})
export class CutListGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server): void {
    server.use(createWsAuthMiddleware(this.jwtService));
  }

  @OnEvent("cut-list.claimChanged")
  handleClaimChanged(id: number): void {
    this.server.emit("claimChanged", { id });
  }

  @OnEvent("pipe-length.statusChanged")
  handleStatusChanged(pipeLength: PipeLengthEntity): void {
    this.server.emit("statusChanged", wrap(pipeLength).toObject());
  }
}
