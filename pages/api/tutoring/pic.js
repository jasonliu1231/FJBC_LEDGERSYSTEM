import pool from "/lib/pgdb";

export default async function checkPerm(req, res) {
  const { start, end } = req.query;
  const sql = `SELECT charge_date, tutoring_id,
                SUM(tsid.money) - SUM(discount) - SUM(deposit) - SUM(coupon) + SUM(meal) + SUM(textbook) + SUM(transportation) AS total
                FROM tutoring_student_invoice i
                LEFT JOIN tutoring_student_invoice_detail tsid ON tsid.invoice_id = i.id
                WHERE handler_id IS NOT NULL AND reason IS NULL AND reject IS NULL AND charge_date >= $1 AND charge_date <= $2
                GROUP BY charge_date, tutoring_id
                ORDER BY charge_date;`;
  try {
    const result = await pool.query(sql, [start, end]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
  }
}
