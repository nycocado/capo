import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint de healthcheck (liveness), consumido pelo HEALTHCHECK do Docker.
   * @returns status do serviço
   */
  @Get("health")
  getHealth(): { status: string } {
    return this.appService.getHealth();
  }
}
