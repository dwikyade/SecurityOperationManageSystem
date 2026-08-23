import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: mysql.Pool | undefined;
};

function getPool() {
  if (!globalForDb.pool) {
    globalForDb.pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return globalForDb.pool;
}

export const db = drizzle(getPool(), { schema, mode: "default" });
