import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DATABASE_HOST as string,
    user: process.env.DATABASE_USER as string,
    database: process.env.DATABASE_NAME as string,
  },
});