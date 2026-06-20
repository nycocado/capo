import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { swaggerConfig } from "@config/swagger.config";
import { SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: config.getOrThrow<string>("CORS_ORIGIN"),
    credentials: true,
  });

  if (config.get("NODE_ENV") !== "production") {
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("api", app, document);
  }

  await app.listen(config.get<number>("PORT") ?? 3000);
}

bootstrap();
