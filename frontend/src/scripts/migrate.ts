import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { config } from "dotenv";
import i18n from "../i18n";
import { I18nKey } from "../i18n/declaration";

config();

const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  process.stderr.write(`${i18n.t(I18nKey.MIGRATION$URL_REQUIRED)}\n`);
  process.exit(1);
}

process.stdout.write(`${i18n.t(I18nKey.MIGRATION$STARTING)}\n`);

try {
  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  await migrate(db, { migrationsFolder: "./drizzle" });

  process.stdout.write(`${i18n.t(I18nKey.MIGRATION$SUCCESS)}\n`);
} catch (error) {
  process.stderr.write(
    `${i18n.t(I18nKey.MIGRATION$FAILED)} ${String(error)}\n`,
  );
  process.exit(1);
}

process.exit(0);
