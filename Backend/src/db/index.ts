import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

export const client = postgres(env.DATABASE_URL, { max: 3 });

export const db = drizzle(client, { schema });
export default db;
