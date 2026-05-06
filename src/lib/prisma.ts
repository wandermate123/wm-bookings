import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

/** Shared client for Node server (API routes). Uses Neon pooled `DATABASE_URL` + WebSockets. */
export const prisma =
  globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrisma());
