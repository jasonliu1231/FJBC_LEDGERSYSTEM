import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "172.16.150.26",
  database: "fjbc_api",
  password: "8ff-1K=jMTot7z",
  port: 5432
});

export default pool;
