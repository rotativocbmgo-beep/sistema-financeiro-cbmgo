// Exemplo de pool com pg (ajuste conforme sua necessidade/ORM)
import { Pool } from "pg";
const url = process.env.DATABASE_URL;
export const pool = new Pool({
  connectionString: url,
  ssl: url?.includes("neon.tech") ? { rejectUnauthorized: false } : false as any
});
