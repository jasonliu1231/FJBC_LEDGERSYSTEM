import pool from "/lib/pgdb";
import { Expo } from "expo-server-sdk";

export default async function expoPushNotification(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { title, message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  await pool.query(`INSERT INTO notifications(type, type_detail, content) VALUES ($1, $2, $3);`, [2, title, message]);

  const sql = `SELECT ARRAY_AGG(DISTINCT push_token) token_list FROM mobile_user WHERE type IN (1, 2) GROUP BY type`;
  const result = await pool.query(sql);
  const tokens = result.rows[0].token_list;

  console.log(tokens);

  if (!tokens) {
    return res.status(500).json({ success: false, error: "資料庫中無使用者！" });
  }

  // 建立 Expo SDK 的實例
  const expo = new Expo();

  // 檢查並建立推播訊息
  const messages = tokens
    .map((token) => {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`推播 Token 無效: ${token}`);
        return null;
      }

      return {
        to: token,
        sound: "default", // 預設音效
        title: title, // 通知標題
        body: message // 通知內容
      };
    })
    .filter(Boolean);

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  try {
    // 發送通知
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("通知發送結果:", ticketChunk);
      tickets.push(...ticketChunk);
    }

    return res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("通知發送失敗:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
