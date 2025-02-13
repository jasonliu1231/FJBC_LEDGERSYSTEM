import pool from "../../../lib/msdb";

export default async function handler(req, res) {
  const date = req.query.date;
  const sql = `
    WITH detail AS (
        SELECT
            OrderDetail.OrderID,
            OrderDetail.delProductName,
            OrderDetail.Amount,
            OrderDetail.Price,
            OrderDetail.Discount,
            OrderDetail.DiscountInput,
            OrderDetail.DiscountAmount,
            OrderDetail.UseMemberDiscount,
            OrderDetail.TasteTotalPrice,
            OrderDetail.DiscountPrice,
            OrderDetail.TotalPrice
        FROM
            OrderDetail
        INNER JOIN Orders ON Orders.OrderID = OrderDetail.OrderID
        WHERE OrderDate BETWEEN '${date} 00:00:00' AND '${date} 23:59:59'
    )
    SELECT
        CASE 
            WHEN Orders.OrderNumber LIKE '%SA%' THEN '銷貨'
            WHEN Orders.OrderNumber LIKE '%CA%' THEN '退貨'
            ELSE '其他'
        END AS OrderType,
        Orders.OrderNumber,
        PayTypeName,
        CASE
            WHEN InvoiceNo IS NULL THEN '不開'
            ELSE '二聯'
        END InvoiceNo,
        DetailTaxableAmount,
        DetailTaxAmount,
        InvoiceTrack + InvoiceNo Invoice,
        PrintMark,
        NPOBAN,
        CarrierDisplayedID,
        InvoiceTime,
        re_data.OrderNumber return_OrderNumber,
        (
            SELECT
                delProductName,
                Amount,
                Price,
                Discount,
                DiscountInput,
                DiscountAmount,
                UseMemberDiscount,
                TasteTotalPrice,
                DiscountPrice,
                TotalPrice
            FROM detail
            WHERE detail.OrderID = Orders.OrderID
            ORDER BY delProductName
            FOR JSON PATH
        ) AS detailArray
    FROM
        Orders
        LEFT JOIN OrderPays ON Orders.OrderID = OrderPays.OrderID AND OrderPays.RecordType = 0
        LEFT JOIN InvoiceOrderTaxData ON Orders.OrderID = InvoiceOrderTaxData.OrderID
        LEFT JOIN InvoiceNumber ON InvoiceOrderTaxData.InvoiceID = InvoiceNumber.InvoiceID
        LEFT JOIN OrdersReturnOrChange ON OrdersReturnOrChange.OrderID_From = Orders.OrderID
        LEFT JOIN Orders re_data ON OrdersReturnOrChange.OrderID_To = re_data.OrderID
    WHERE Orders.OrderDate BETWEEN '${date} 00:00:00' AND '${date} 23:59:59' AND Orders.OrderNumber IS NOT NULL
    ORDER BY
        Orders.OrderDate DESC
    `;
  try {
    const result = await pool.request().query(sql);
    const data = result.recordset; // 取得資料

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "資料撈取失敗" });
  } finally {
    // pool.close();
  }
}
