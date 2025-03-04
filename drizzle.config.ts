import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "mvotedb",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "root",
    ssl: process.env.DB_SSL === 'true'
  },
});
