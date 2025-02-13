import pool from "/lib/pgdb";
import { checkPerm } from "./perm";
import axios from "axios";

export default async function handler(req, res) {
  // const user_id = req.headers?.user_id;
  // const check = await checkPerm(user_id);
  // if (!check) {
  //   res.status(400).json({ msg: "權限不足" });
  //   return;
  // }
  if (req.method == "GET") {
    const { start, end } = req.query;
    const params = [];
    let sql = `SELECT 
                  i.id, u.first_name, i.start_month, i.end_month, payment_method, checkmoney, reject, charge_date, discount, deposit, coupon, 
                  meal, textbook, transportation, remark, SUM(tsid.money), t.tutoring_name, t.id tid FROM tutoring_student_invoice i
                LEFT JOIN tutoring_student_invoice_detail tsid ON tsid.invoice_id = i.id
                LEFT JOIN tutoring t ON i.tutoring_id = t.id
                LEFT JOIN student s ON i.student_id = s.id
                LEFT JOIN "user" u ON s.user_id = u.id
                WHERE i.reason IS NULL AND i.handler_id IS NOT NULL`;

    if (start || end) {
      if (start) {
        sql += ` AND charge_date >= $${params.length + 1}`;
        params.push(start);
      }
      if (end) {
        sql += ` AND charge_date <= $${params.length + 1}`;
        params.push(end);
      }
    }

    sql += ` GROUP BY i.id, t.id, u.id ORDER BY checkmoney DESC, charge_date DESC`;
    try {
      const result = await pool.query(sql, params);
      res.status(200).json(result.rows);
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "資料撈取失敗" });
    }
  } else if (req.method == "PUT") {
    const { item, type, alert, reject } = req.body;
    try {
      if (type == 1) {
        await pool.query(`UPDATE tutoring_student_invoice SET checkmoney=now() WHERE id=$1`, [item.id]);
      } else if (type == 2) {
        await pool.query(`UPDATE tutoring_student_invoice SET reject=$1 WHERE id=$2`, [reject || "財務部註銷", item.id]);
      }
      if (alert) {
        const d = new Date(item.charge_date);
        const date = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
        let message = `\n${item.tid == 1 ? "私立多易文理短期補習班" : item.tid == 2 ? "私立艾思短期補習班" : item.tutoring_name}\n姓名：${item.first_name}\n收費方式：${
          item.payment_method == 1 ? "現金" : item.payment_method == 2 ? "轉帳" : item.payment_method == 3 ? "信用卡" : "其他"
        }\n繳費日期：${date}\n實收：${(Number(item.sum) + item.textbook + item.meal + item.transportation - item.discount - item.coupon).toLocaleString()}\n${type == 1 ? "已確認收款" : "已註銷款項"}`;

        if (type == 2) {
          message += `\n原因：${reject}`;
        }

        LineAlert(message);
      }
      res.status(200).json({});
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: "資料撈取失敗" });
    }
  }
}

async function LineAlert(message) {
  try {
    await axios.post(
      "https://notify-api.line.me/api/notify",
      new URLSearchParams({
        message: message
      }),
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMENT_CHECKED_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    console.log("Line 通知已發送");
  } catch (error) {
    console.error("發送 Line 通知時出錯:", error);
  }
}
