import pool from "/lib/pgdb";
import { checkPerm } from "./perm";

export default async function handler(req, res) {
  // const user_id = req.headers?.user_id;
  // const check = await checkPerm(user_id);
  // if (!check) {
  //   res.status(400).json({ msg: "權限不足" });
  //   return;
  // }
  const { start, end, year, month } = req.query;
  const params = [];
  let sql = `
    WITH invoice_refund AS
    (
      SELECT
        tutoring_student_invoice_id,
        start_month,
          end_month,
        SUM(meal_refund) meal_refund,
          SUM(textbook_refund) textbook_refund,
          SUM(transportation_refund) transportation_refund,
        SUM(course_refund_money) course_refund_money
      FROM tutoring_student_invoice_refund_detail
      GROUP BY tutoring_student_invoice_id, start_month, end_month
    )
    SELECT 
      i.id, 
      u.first_name, 
      i.school_year, 
      i.start_month, 
      i.end_month, 
      CASE WHEN i.end_month >= i.start_month THEN i.end_month - i.start_month +1 ELSE i.end_month + 12 - i.start_month +1 END,
      i.discount, 
      i.deposit, 
      i.coupon, 
      i.meal, 
      i.textbook, 
      i.transportation, 
      i.remark, 
      SUM(tsid.money), 
      t.tutoring_name, 
      t.id tid ,
      ir.start_month,
      ir.end_month,
      ir.meal_refund,
      ir.textbook_refund,
      ir.transportation_refund,
      ir.course_refund_money,
      CASE WHEN ir.tutoring_student_invoice_id IS NULL THEN false ELSE true END hsaRefund
    FROM tutoring_student_invoice i
    LEFT JOIN tutoring_student_invoice_detail tsid ON tsid.invoice_id = i.id
    LEFT JOIN tutoring t ON i.tutoring_id = t.id
    LEFT JOIN student s ON i.student_id = s.id
    LEFT JOIN "user" u ON s.user_id = u.id
    LEFT JOIN invoice_refund ir ON ir.tutoring_student_invoice_id = i.id
    WHERE i.reason IS NULL AND i.handler_id IS NOT NULL
  `;

  if (year) {
    sql += ` AND school_year=$${params.length + 1}`;
    params.push(year);
  }
  if (month) {
    sql += ` AND  (
                (start_month <= $${params.length + 1} AND end_month >= $${params.length + 1})
                OR
                (start_month <= $${params.length + 1} AND end_month < start_month AND $${params.length + 1} <= 12)
                OR
                (end_month >= $${params.length + 1} AND end_month < start_month AND $1 >= 1)
            )`;
    params.push(month);
  }
  if (start || end) {
    if (start) {
      sql += ` AND i.charge_date >= $${params.length + 1}`;
      params.push(start);
    }
    if (end) {
      sql += ` AND i.charge_date <= $${params.length + 1}`;
      params.push(end);
    }
  }
  sql += ` GROUP BY i.id, t.id, u.id ,ir.tutoring_student_invoice_id, ir.start_month, 
          ir.end_month, ir.meal_refund, ir.textbook_refund, ir.transportation_refund, ir.course_refund_money
          ORDER BY i.id`;
  try {
    const result = await pool.query(sql, params);
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "資料撈取失敗" });
  }
}
