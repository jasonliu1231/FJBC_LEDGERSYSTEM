import pool from "/lib/pgdb";

export async function checkPerm(id) {
  const sql = `SELECT * FROM "user" u 
            LEFT JOIN user_role_link url ON url.user_id = u.id
            WHERE u.id = $1 AND role_id = 7`;
  try {
    const result = await pool.query(sql, [id]);
    const len = result.rows.length;
    if (len > 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}
