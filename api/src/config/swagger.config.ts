import { DocumentBuilder } from "@nestjs/swagger";

export const swaggerConfig = new DocumentBuilder()
  .setTitle("CAPO API")
  .setDescription(
    "REST API for CAPO, a metallurgical management web application.",
  )
  .setVersion("1.0")
  .addCookieAuth("token")
  .build();
