"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const tutoring = [
  { id: 1, name: "多易" },
  { id: 2, name: "艾思" },
  { id: 3, name: "華而敦" },
  { id: 4, name: "食材" }
];

let invoice_id = 0;
const today = new Date();
const year_list = [];
for (let i = 2024; i <= today.getFullYear(); i++) {
  year_list.push(i);
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [tutoringId, setTutoringId] = useState(0);
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [student, setStudent] = useState("");

  const filteredItems =
    student === ""
      ? items
      : items.filter((item) => {
          const name = item.c_name.toLowerCase() || "";
          return name.includes(student.toLowerCase());
        });

  function getTableData() {
    const table = document.getElementById("myTable");
    const rows = table.querySelectorAll("tbody tr");

    // 提取表格中的資料，只選擇 Name 和 Age 欄位
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      console.log(cells);
      data.push({
        類型: cells[0].innerText,
        單位: cells[1].innerText,
        姓名: cells[2].innerText,
        收退方式: cells[3].innerText,
        學年: cells[4].innerText,
        月份: cells[5].innerText,
        學費: cells[6].innerText,
        教材費: cells[7].innerText,
        餐費: cells[8].innerText,
        交通費: cells[9].innerText,
        折扣: cells[10].innerText,
        優惠券: cells[11].innerText,
        訂金: cells[12].innerText,
        實收: cells[13].innerText
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
      XLSX.writeFile(workbook, `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_Payment.xlsx`);
    };

    return (
      <button
        className="m-1 relative inline-flex rounded-md items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-4 ring-inset ring-green-300 hover:bg-gray-50 focus:z-10"
        onClick={exportTableToExcel}
      >
        Excel
      </button>
    );
  }

  async function getPaymentDetail() {
    setItems();
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    let url = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/financial_statements_month?`;
    if (year != "") {
      url += `year=${year}&`;
    }
    if (month != "") {
      url += `month=${month}&`;
    }
    if (tutoringId != 0) {
      url += `tutoring_id=${tutoringId}`;
    }
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      setItems(res);
    } else {
      alert(res.msg);
    }
  }
  useEffect(() => {
    getPaymentDetail();
  }, [year, month, tutoringId]);

  return (
    <div className="container mx-auto p-2">
      <div className="grid grid-cols-7 gap-x-1">
        <div className="col-span-1 text-xl font-semibold text-gray-900">繳費拆賬統計</div>
        <div className="col-span-1">
          <input
            value={student}
            onChange={(e) => {
              setStudent(e.target.value);
            }}
            type="text"
            placeholder="學生姓名"
            className="p-2 w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
          />
        </div>
        <div className="col-span-1">
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
            }}
            className="p-2 w-full rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300"
          >
            <option value={0}>不限年</option>
            {year_list.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
            }}
            className="p-2 w-full rounded-md border-0 text-gray-900 ring-1 ring-inset ring-gray-300"
          >
            <option value={0}>不限月</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
          </select>
        </div>
        <div className="col-span-2">
          <span className="isolate inline-flex rounded-md shadow-sm mx-1">
            <button
              onClick={() => {
                setTutoringId(0);
              }}
              type="button"
              className={`${
                tutoringId == 0 ? "ring-2 ring-blue-300" : "ring-1 ring-gray-300"
              } ring-inset relative inline-flex items-center bg-white rounded-l-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
            >
              全部
            </button>
            <button
              onClick={() => {
                setTutoringId(1);
              }}
              type="button"
              className={`${
                tutoringId == 1 ? "ring-2 ring-blue-300" : "ring-1 ring-gray-300"
              } ring-inset relative inline-flex items-center bg-white p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
            >
              多易
            </button>
            <button
              onClick={() => {
                setTutoringId(2);
              }}
              type="button"
              className={`${
                tutoringId == 2 ? "ring-2 ring-blue-300" : "ring-1 ring-gray-300"
              } ring-inset relative inline-flex items-center bg-white p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
            >
              艾思
            </button>
            <button
              onClick={() => {
                setTutoringId(3);
              }}
              type="button"
              className={`${
                tutoringId == 3 ? "ring-2 ring-blue-300" : "ring-1 ring-gray-300"
              } ring-inset relative inline-flex items-center bg-white rounded-r-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
            >
              華而敦
            </button>
          </span>
        </div>
        <div className="col-span-1">
          {" "}
          <span className="isolate inline-flex">
            <ExportToExcel />
          </span>
        </div>
      </div>

      <div className="relative mt-6 flex-1">
        {items ? (
          <table
            id="myTable"
            className="min-w-full"
          >
            <thead className="bg-green-100 sticky top-0">
              <tr>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900"
                >
                  類型
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900"
                >
                  補習班
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900"
                >
                  姓名
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-center"
                >
                  收退方式
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-center"
                >
                  學年
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-center"
                >
                  月份
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  學費
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  教材費
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  餐費
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  交通費
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  折扣
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  優惠券
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  訂金
                </th>
                <th
                  scope="col"
                  className="p-2 text-left text-sm font-semibold text-gray-900 text-right"
                >
                  實收
                </th>
              </tr>
            </thead>
            <tbody className="bg-white border-4 border-pink-200">
              {filteredItems?.map((item, index) => {
                if (item.invoice_id != invoice_id) {
                  invoice_id = item.invoice_id;
                  return (
                    <tr
                      key={index}
                      className="hover:bg-blue-100 border-t-4 border-pink-200"
                    >
                      <td className={`${item.is_refund ? "text-red-500" : "text-green-500"} whitespace-nowrap p-2 text-sm`}>{item.is_refund ? "退費" : "收費"}</td>
                      <td className="whitespace-nowrap p-2 text-sm font-medium text-gray-900">{tutoring.filter((i) => i.id == item.tutoring_id)[0].name}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">
                        <a
                          className="text-blue-400"
                          href={`/admin/invoice?id=${item.invoice_id}`}
                        >
                          {item.c_name}
                        </a>
                      </td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{item.payment_method}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{item.school_year}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{item.month}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.money.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.textbook.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.meal.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.transportation.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.discount.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.coupon.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.deposit.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">
                        {(item.money + item.textbook + item.meal + item.transportation - item.discount - item.coupon - item.deposit).toLocaleString()}
                      </td>
                    </tr>
                  );
                } else {
                  return (
                    <tr
                      key={index}
                      className="hover:bg-blue-100 border-t border-gray-100"
                    >
                      <td className={`${item.is_refund ? "text-red-500" : "text-green-500"} whitespace-nowrap p-2 text-sm`}>{item.is_refund ? "退費" : "收費"}</td>
                      <td className="whitespace-nowrap p-2 text-sm font-medium text-gray-900">{tutoring.filter((i) => i.id == item.tutoring_id)[0].name}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">
                        <a
                          className="text-blue-400"
                          href={`/admin/invoice?id=${item.invoice_id}`}
                        >
                          {item.c_name}
                        </a>
                      </td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{item.payment_method}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{item.school_year}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{item.month}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.money.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.textbook.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.meal.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.transportation.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.discount.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.coupon.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.deposit.toLocaleString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">
                        {(item.money + item.textbook + item.meal + item.transportation - item.discount - item.coupon - item.deposit).toLocaleString()}
                      </td>
                    </tr>
                  );
                }
                console.log(invoice_id);
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
}
