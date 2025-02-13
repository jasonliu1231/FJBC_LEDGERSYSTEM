import pool from "/lib/pgdb";

export default async function handler(req, res) {
  const id = req.query.id;

  try {
    const data = {};
    let result = await pool.query(`SELECT u.first_name, t.tutoring_name, i.* FROM tutoring_student_invoice i 
                                    LEFT JOIN tutoring t ON i.tutoring_id = t.id
                                    LEFT JOIN student s ON i.student_id = s.id
                                    LEFT JOIN "user" u ON s.user_id = u.id WHERE i.id=$1`, [id]);
    data.invoice = result.rows[0];
    result = await pool.query(`SELECT * FROM tutoring_student_invoice_detail WHERE invoice_id=$1`, [id]);
    data.detail = result.rows;
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json({ msg: "系統錯誤" });
  }
}
