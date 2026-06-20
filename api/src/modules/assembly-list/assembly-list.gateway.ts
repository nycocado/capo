import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { wrap } from "@mikro-orm/core";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { createWsAuthMiddleware } from "@common/ws";

/** Difunde os eventos do estágio de montagem no namespace `assembly-list`. */
@WebSocketGateway({
  namespace: "assembly-list",
  cors: { origin: process.env.CORS_ORIGIN ?? false, credentials: true },
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

  /**
   * Concluir o corte muda o gating da montagem (novas ordens ficam disponíveis):
   * reemite como sinal de invalidação para os clientes desta etapa refazerem a
   * lista. O payload é irrelevante — o cliente apenas invalida a query.
   */
  emitUpstream(): void {
    this.server.emit("statusChanged", { upstream: true });
  }
}
