import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  /**
   * Liveness check do processo da API.
   * @returns status fixo "ok"
   */
  getHealth(): { status: string } {
    return { status: "ok" };
  }
}
