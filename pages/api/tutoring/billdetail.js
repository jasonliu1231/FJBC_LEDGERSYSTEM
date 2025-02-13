import pool from "/lib/pgdb";
import { checkPerm } from "./perm";

export default async function handler(req, res) {
  const user_id = req.headers?.user_id;
  const check = await checkPerm(user_id);
  if (!check) {
    res.status(400).json({ msg: "權限不足" });
    return;
  }
  const { id, start, end, order, state } = req.query;
  let params = [];
  let sql = `SELECT id, content, department, departmentid, money, date, invoice, state, remark, createby FROM billdetail`;

  if (id) {
    sql += ` WHERE departmentid=$1`;
    params.push(id);
  } else {
    sql += ` WHERE 1=1`;
  }

  if (state) {
    sql += ` AND state=$${params.length + 1}`;
    params.push(state);
  }

  if (start || end) {
    if (start) {
      sql += ` AND date >= $${params.length + 1}`;
      params.push(start);
    }
    if (end) {
      sql += ` AND date <= $${params.length + 1}`;
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
    res.status(400).json({ msg: "系統錯誤" });
  }
}
