import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { conversations, messages } from "./schema";
import i18n from "../i18n";
import { I18nKey } from "../i18n/declaration";

if (!import.meta.env.VITE_DATABASE_URL) {
  throw new Error(i18n.t(I18nKey.DATABASE$URL_REQUIRED));
}

// Create the connection
const sql = neon(import.meta.env.VITE_DATABASE_URL!);

// Create the database instance
export const db = drizzle(sql, {
  schema: { conversations, messages },
});

export type Database = typeof db;
