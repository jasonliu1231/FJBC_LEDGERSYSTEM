import pool from "/lib/pgdb";
import { checkPerm } from "./perm";

export default async function handler(req, res) {
  const user_id = req.headers?.user_id;
  const check = await checkPerm(user_id);
  if (!check) {
    res.status(400).json({ msg: "權限不足" });
    return;
  }
  const { id, start, end, order } = req.query;
  const params = [];
  let sql = `SELECT pd.id, pd.tutoringid, p.name name, pd.state, pd.quantity, pd.money, pd.createdate, pd.remark, pd.createby FROM productdetail pd
        LEFT JOIN product p ON pd.productid = p.id `;

  if (id) {
    sql += ` WHERE tutoringid=$1`;
    params.push(id);
  } else {
    sql += ` WHERE 1=1`; // 為了避免 AND 語句出錯
  }

  if (start || end) {
    if (start) {
      sql += ` AND pd.createdate >= $${params.length + 1}`;
      params.push(start);
    }
    if (end) {
      sql += ` AND pd.createdate <= $${params.length + 1}`;
      params.push(end);
    }
  }

  if (order) {
    sql += ` ORDER BY ${order} DESC`;
  }

  try {
    const result = await pool.query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(400).json({ msg: "資料撈取失敗" });
  }
}
