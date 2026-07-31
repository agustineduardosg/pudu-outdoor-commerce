import "server-only";

import { PrismaClient } from "@prisma/client";

import { demoModeAllowed } from "./env";
import { ConfigurationError } from "./errors";

const globalForPrisma = globalThis as unknown as {
  puduPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.puduPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.puduPrisma = prisma;
}

export function getDatabase(): PrismaClient | null {
  if (process.env.DATABASE_URL) return prisma;
  if (demoModeAllowed()) return null;
  throw new ConfigurationError("DATABASE_URL es obligatorio.");
}

export async function databaseReadiness(): Promise<{
  ready: boolean;
  mode: "database" | "demo";
}> {
  const db = getDatabase();
  if (!db) return { ready: true, mode: "demo" };

  try {
    await db.$queryRaw`SELECT 1`;
    return { ready: true, mode: "database" };
  } catch {
    return { ready: false, mode: "database" };
  }
}
