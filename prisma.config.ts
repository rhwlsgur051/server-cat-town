import "dotenv/config";
import { defineConfig, env } from "prisma/config";
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // DATABASE_URL 대신 host/port/user/password/name 으로 조합
    url: `mysql://${env("DATABASE_USER")}:${env("DATABASE_PASSWORD")}@${env("DATABASE_HOST")}:${env("DATABASE_PORT")}/${env("DATABASE_NAME")}`,
  },
});