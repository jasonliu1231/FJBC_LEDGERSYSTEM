"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const today = new Date().toISOString().split("T")[0];

export default function Home() {
  const [items, setItems] = useState([]);
  const [date, setDate] = useState(today);
  const [amount, setAmount] = useState(0);
  const [query, setQuery] = useState("");

  const filteredItems =
    query === ""
      ? items
      : items.filter((item) => {
          const OrderNumber = item.OrderNumber.toLowerCase() || "";
          const return_OrderNumber = item.return_OrderNumber?.toLowerCase() || "";
          return OrderNumber.includes(query.toLowerCase()) || return_OrderNumber.includes(query.toLowerCase());
        });

  function getTableData() {
    const table = document.getElementById("myTable");
    const rows = table.querySelectorAll("tbody tr");

    // 提取表格中的資料，只選擇 Name 和 Age 欄位
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      data.push({
        日期: cells[5].innerText,
        單位: cells[0].innerText,
        商品名稱: cells[1].innerText,
        數量: cells[2].innerText,
        備註: cells[3].innerText,
        金額: cells[4].innerText,
        經手人: cells[6].innerText
      });
    });

    return data;
  }

  function ExportToExcel() {
    const date = new Date();
    const exportTableToExcel = () => {
      // 呼叫函數來取得選定的欄位資料
      const selectedData = getTableData();

      // 將選擇的資料轉為 worksheet
      const worksheet = XLSX.utils.json_to_sheet(selectedData);

      // 創建新的 workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // 將 workbook 寫入 Excel 檔案
      XLSX.writeFile(workbook, `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_Stock.xlsx`);
    };

    return (
      <button
        className="m-1 relative inline-flex rounded-md items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-4 ring-inset ring-green-300 hover:bg-gray-50 focus:z-10"
        onClick={exportTableToExcel}
      >
        下載 Excel
      </button>
    );
  }

  async function getPosData() {
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    };
    let api = `/api/pos/list?date=${date}`;

    const response = await fetch(api, config);
    const res = await response.json();
    if (response.ok) {
      setItems(res);
      setAmount(res.reduce((sum, item) => (item.OrderType == "銷貨" ? sum + item.DetailTaxableAmount : sum - item.DetailTaxableAmount), 0));
    } else {
      console.log(res.msg);
    }
  }

  useEffect(() => {
    getPosData();
  }, [date]);

  return (
    <div className="container mx-auto">
      <div className="flex items-end justify-between py-4">
        <div className="text-xl font-semibold text-gray-900">ＰＯＳ機銷售表（測試版）</div>
        <div className="flex items-end">
          {/* <div className="w-40 text-xl">發票總金額:{amount}</div> */}
          <input
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            value={query}
            type="text"
            className="ring ring-gray-400 rounded-sm px-2 py-1 mx-2"
            placeholder="輸入單號"
          />
          <input
            onChange={(e) => {
              setDate(e.target.value);
            }}
            value={date}
            type="date"
            className="ring ring-gray-400 rounded-sm px-2 py-1"
          />
        </div>
      </div>
      <div>
        <table
          id="myTable"
          className="min-w-full divide-y divide-gray-300"
        >
          <thead className="bg-green-100 sticky top-0">
            <tr>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                類別
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                單號
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                發票狀態
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                發票號碼
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                發票日期
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                捐贈碼
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                載具
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-left"
              >
                付款方式
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-right"
              >
                發票含稅
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 text-right"
              >
                發票稅額
              </th>
              <th
                scope="col"
                className="px-2 py-3 text-sm font-semibold text-gray-900 w-1/3"
              >
                內容
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredItems.map((item, i) => {
              const detail = JSON.parse(item.detailArray);
              return (
                <tr
                  key={i}
                  className={`${item.OrderType == "退貨" ? "bg-pink-100" : "bg-white"} hover:bg-blue-50`}
                >
                  <td className="whitespace-nowrap px-2 py-3 text-md text-orange-500">{item.OrderType}</td>
                  <td className={`whitespace-nowrap px-2 py-3 text-sm cursor-pointer`}>
                    <div
                      onClick={() => {
                        setQuery(item.OrderNumber);
                      }}
                      className="text-gray-700 hover:text-blue-600"
                    >
                      {item.OrderNumber}
                    </div>
                    <div
                      onClick={() => {
                        setQuery(item.return_OrderNumber);
                      }}
                      className="text-red-700 font-semibold hover:text-blue-600"
                    >
                      {item.return_OrderNumber}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-pink-500">{item.InvoiceNo}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-blue-500">{item.Invoice}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-500">
                    <div>{item.InvoiceTime && item.InvoiceTime.split("T")[0]}</div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-500">{item.NPOBAN}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-500">{item.PrintMark == "Y" ? "實體發票" : item.CarrierDisplayedID}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-500">{item.PayTypeName}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-md text-red-500 text-right">${item.DetailTaxableAmount || 0}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-md text-red-500 text-right">{item.DetailTaxAmount || 0}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-sm text-gray-500">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-green-50">
                        <tr>
                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-left w-1/2"
                          >
                            品名
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-left"
                          >
                            折數
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-right"
                          >
                            單價
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-right"
                          >
                            加值
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-right"
                          >
                            數量
                          </th>

                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-right"
                          >
                            折扣
                          </th>
                          <th
                            scope="col"
                            className="py-2 text-sm font-semibold text-gray-900 text-right"
                          >
                            實收
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {detail?.map((item, ii) => {
                          return (
                            <tr
                              key={ii}
                              className="hover:bg-orange-50"
                            >
                              <td className="whitespace-nowrap py-2 text-sm text-blue-500 text-left">{item.delProductName}</td>
                              <td className="whitespace-nowrap py-2 text-sm text-gray-500 text-left">{item.Discount || 100}％</td>
                              <td className="whitespace-nowrap py-2 text-sm text-gray-500 text-right">{item.Price}</td>
                              <td className="whitespace-nowrap py-2 text-sm text-gray-500 text-right">{item.TasteTotalPrice || 0}</td>
                              <td className="whitespace-nowrap py-2 text-sm text-gray-500 text-right">{item.Amount}</td>
                              <td className="whitespace-nowrap py-2 text-sm text-gray-500 text-right">{item.DiscountPrice}</td>
                              <td className="whitespace-nowrap py-2 text-sm text-gray-500 text-right">{item.TotalPrice}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
