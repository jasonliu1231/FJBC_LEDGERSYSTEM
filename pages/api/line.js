import axios from "axios";
import pool from "/lib/pgdb";

export default async function checkPerm(req, res) {
  const message = req.body.message;
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
    res.status(200).json({ msg: "Line 通知已發送" });
  } catch (error) {
    console.error("發送 Line 通知時出錯:", error);
    res.status(400);
  }
}
