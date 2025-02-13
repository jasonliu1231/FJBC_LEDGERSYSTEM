"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const tutoring = [
  { id: 1, name: "多易" },
  { id: 2, name: "艾思" },
  { id: 3, name: "華而敦" },
  { id: 4, name: "總倉庫" }
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({
    tutoring_id: 4,
    type: 8,
    index: false
  });
  const [logList, setLogList] = useState([]);
  const [query, setQuery] = useState("");

  const filteredItems =
    query === ""
      ? logList
      : logList.filter((item) => {
          const name = item.product_name.toLowerCase() || "";
          return name.includes(query.toLowerCase());
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

  async function getProductsDetail() {
    setLoading(true);
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    let api = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring_product_detail/list?tutoringid=${search.tutoring_id}&order_num=${search.type}&order_type=${search.index}`;

    const response = await fetch(api, config);
    const res = await response.json();
    if (response.ok) {
      setLogList(res);
    } else {
      const msg = error(response.status, res);
      setInfo({
        show: true,
        success: false,
        msg: "錯誤" + msg
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    getProductsDetail();
  }, [search]);

  return (
    <div className="container mx-auto">
      <div className="flex items-end justify-between mt-4">
        <div className="text-xl font-semibold text-gray-900">補習班進出貨紀錄</div>
        <span className="isolate inline-flex rounded-md">
          <input
            onChange={(event) => setQuery(event.target.value)}
            value={query}
            type="text"
            placeholder="名稱"
            className="m-1 relative inline-flex rounded-md items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
          />
          {tutoring.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSearch({
                  ...search,
                  tutoring_id: item.id
                });
              }}
              type="button"
              className={`${
                item.id == search.tutoring_id ? "bg-blue-200" : "bg-white"
              } m-1 relative inline-flex rounded-md items-center px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300`}
            >
              {item.name}
            </button>
          ))}
        </span>
      </div>

      <div className="relative mt-6 flex-1 px-4 sm:px-6">
        <div className="">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-green-100 text-gray-900 sticky top-0">
              <tr>
                <th
                  onClick={() => {
                    if (search.type == 1) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 1,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  名稱
                </th>
                <th
                  onClick={() => {
                    if (search.type == 4) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 4,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  狀態
                </th>
                <th
                  onClick={() => {
                    if (search.type == 5) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 5,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  數量
                </th>
                <th
                  onClick={() => {
                    if (search.type == 6) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 6,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  單價
                </th>
                <th
                  onClick={() => {
                    if (search.type == 7) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 7,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  備註
                </th>
                <th
                  onClick={() => {
                    if (search.type == 9) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 9,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  用途
                </th>
                <th
                  onClick={() => {
                    if (search.type == 8) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 8,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="text-left text-sm font-semibold whitespace-nowrap hover:bg-blue-300 cursor-pointer p-2"
                >
                  紀錄日期
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td className="flex justify-center items-center py-2">
                    <div className="spinner"></div>
                    <span className="mx-4 text-blue-500">資料讀取中...</span>
                  </td>
                </tr>
              ) : (
                filteredItems.map((log) => (
                  <tr
                    key={log.id}
                    className="text-gray-500 hover:bg-blue-100"
                  >
                    <td className="text-sm font-medium p-2">{log.product_name}</td>
                    <td className={`${log.state ? "text-green-500" : "text-red-500"} text-sm font-medium p-2`}>{log.state ? "進貨" : "出貨"}</td>
                    <td className={`${log.state ? "text-green-500" : "text-red-500"} text-sm font-medium p-2`}>{log.quantity}</td>
                    <td className="whitespace-nowrap text-sm p-2">${log.money || 0}</td>
                    <td className="text-sm">{log.remark}</td>
                    <td className="p-2 whitespace-nowrap text-sm">{log.usage == 1 ? "學生用" : log.usage == 2 ? "教師用" : log.usage == 3 ? "行政用" : log.usage == 10 ? "租借" : ""}</td>
                    <td className="p-2 whitespace-nowrap text-sm">{new Date(log.create_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
