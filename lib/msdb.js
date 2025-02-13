import sql from "mssql";

const sqlConfig = {
  user: "POS",
  password: "Digican.art",
  database: "sposerp",
  server: "172.16.150.36",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

const pool = await sql.connect(sqlConfig);

export default pool;
