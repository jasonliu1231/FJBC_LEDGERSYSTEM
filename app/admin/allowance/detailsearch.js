"use client";

import { useContext, useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [departmentList, setDepartmentList] = useState([]);
  const [billDetailList, setBillDetailList] = useState([]);
  const [date, setDate] = useState({
    start_date: "",
    end_date: ""
  });
  const [selectDepartment, setSelectDepartment] = useState([]);

  function getTableData() {
    const table = document.getElementById("myTable");
    const rows = table.querySelectorAll("tbody tr");

    // 提取表格中的資料，只選擇 Name 和 Age 欄位
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      console.log(cells);
      data.push({
        日期: cells[0].innerText,
        部門: cells[1].innerText,
        供應商: cells[2].innerText,
        品名: cells[3].innerText,
        數量: cells[4].innerText,
        單位: cells[5].innerText,
        小計: cells[6].innerText,
        備註: cells[7].innerText,
        經辦人: cells[8].innerText
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
      XLSX.writeFile(workbook, `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_Bill.xlsx`);
    };

    return (
      <button
        className="my-1 w-full rounded-md px-2.5 py-1.5 text-sm font-semibold text-green-600 shadow-sm ring-1 ring-inset ring-gray-300 bg-white"
        onClick={exportTableToExcel}
      >
        Excel
      </button>
    );
  }

  async function getDepartment() {
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/department`, config);
    const res = await response.json();

    if (response.ok) {
      setDepartmentList(res);
    }
  }

  async function searchBillDetailList() {
    if (date.start_date == "" || date.end_date == "") {
      alert("日期區間請勿空白");
      return;
    }
    if (selectDepartment.length == 0) {
      alert("請選擇單位");
      return;
    }

    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...date,
        departmentList: selectDepartment
      })
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/system/detailsearch`, config);
    const res = await response.json();

    if (response.ok) {
      setBillDetailList(res);
    }
  }

  useEffect(() => {
    getDepartment();
  }, []);

  return (
    <div className="">
      <div className="grid grid-cols-7 gap-8 border-b-4 p-2">
        <div className="col-span-1 row-span-2">
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">起始日期</label>
            <div>
              <input
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                value={date.start_date}
                onChange={(e) => {
                  setDate({
                    ...date,
                    start_date: e.target.value
                  });
                }}
                type="date"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm/6 font-medium text-gray-900">結束日期</label>
            <input
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              value={date.end_date}
              onChange={(e) => {
                setDate({
                  ...date,
                  end_date: e.target.value
                });
              }}
              name="full_name"
              type="date"
            />
          </div>
        </div>
        <div className="col-span-5 grid grid-cols-5 gap-2 items-center">
          {departmentList.map((item, index) => (
            <button
              key={index}
              className={`${
                selectDepartment.some((id) => id == item.id) ? "bg-pink-200" : "bg-white"
              } w-full rounded-md  px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300`}
              onClick={() => {
                const check = selectDepartment.some((id) => id == item.id);
                if (check) {
                  setSelectDepartment(selectDepartment.filter((id) => id != item.id));
                } else {
                  setSelectDepartment([...selectDepartment, item.id]);
                }
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="col-span-1">
          <button
            color="green"
            className="w-full rounded-md px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-green-300"
            onClick={() => {
              searchBillDetailList();
            }}
          >
            查詢
          </button>
          <ExportToExcel />
        </div>
      </div>
      <table
        id="myTable"
        className="min-w-full divide-y divide-gray-300"
      >
        <thead className="bg-green-100">
          <tr>
            <th>日期</th>
            <th>部門</th>
            <th>供應商</th>
            <th>品名</th>
            <th>數量</th>
            <th>單位</th>
            <th>小計</th>
            <th>備註</th>
            <th>經辦人</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {billDetailList.map((item) => (
            <tr
              key={item.bill_detail_id}
              className="hover:bg-blue-50 dark:hover:bg-gray-700 divide-x divide-gray-200"
            >
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.date}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.department_name}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.supplier_name}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.content}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.quantity}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.unit}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.money}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.remark}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.first_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
