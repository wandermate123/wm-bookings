import { resolve } from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js uses `.env.local`; Prisma CLI reads this file — load both without overriding.
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon: use non-pooled "Direct" connection for Migrate (see .env.example).
    // Runtime app can use pooled DATABASE_URL with the Neon adapter later.
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
