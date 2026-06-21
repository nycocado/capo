import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { MikroORM } from "@mikro-orm/core";

@Injectable()
export class AppService {
  constructor(private readonly orm: MikroORM) {}

  async getHealth(): Promise<{ status: string; database: string }> {
    try {
      await this.orm.em.getConnection().execute("SELECT 1");
      return { status: "ok", database: "up" };
    } catch {
      throw new ServiceUnavailableException({
        status: "degraded",
        database: "down",
      });
    }
  }
}
