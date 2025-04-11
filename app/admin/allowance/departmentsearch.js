"use client";

import { useContext, useEffect, useState } from "react";
import { Dialog } from "@/components/dialog";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectItem, setSelectItem] = useState({});
  const [departmentList, setDepartmentList] = useState([]);
  const [billList, setBillList] = useState([]);
  const [date, setDate] = useState({
    start_date: "",
    end_date: ""
  });
  const [selectDepartment, setSelectDepartment] = useState([]);

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

  async function searchBillList() {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/system/departmentsearch`, config);
    const res = await response.json();

    if (response.ok) {
      setBillList(res);
    }
  }

  useEffect(() => {
    getDepartment();
  }, []);

  return (
    <div className="">
      <Dialog
        open={isOpen}
        onClose={setIsOpen}
        size="4xl"
        className="p-4"
      >
        <div className="font-bold text-xl">
          {selectItem.date} {selectItem.content}
        </div>
        <div className="font-bold text-sm text-gray-600 py-4">
          <span className="mr-4">單位：{selectItem.department_name}</span>
          <span className="mr-4">總支出：{selectItem.amount}</span>
          <span className="mr-4">發票：{selectItem.invoice}</span>
          <span className="mr-4">供應商：{selectItem.supplier_name}</span>
        </div>
        <div>
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-green-100">
              <tr>
                <th>品名</th>
                <th>數量</th>
                <th>單位</th>
                <th>小計</th>
                <th>備註</th>
              </tr>
            </thead>
            <tbody>
              {selectItem.detail?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-blue-50 dark:hover:bg-gray-700 divide-x divide-gray-200"
                >
                  <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.content}</td>
                  <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.quantity}</td>
                  <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.unit}</td>
                  <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.money}</td>
                  <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <button
            className="w-full rounded-md  px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-300"
            onClick={() => setIsOpen(false)}
          >
            關閉
          </button>
        </div>
      </Dialog>

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
            className="w-full rounded-md  px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-green-300"
            onClick={() => {
              searchBillList();
            }}
          >
            查詢
          </button>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-green-100">
          <tr>
            <th>日期</th>
            <th>單位</th>
            <th>明細敘述</th>
            <th>供應商</th>
            <th>狀態</th>
            <th>總計</th>
            <th>發票</th>
            <th>備註</th>
            <th>經辦人</th>
            <th>設定</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {billList.map((bill) => (
            <tr
              key={bill.bill_id}
              className="hover:bg-blue-50 dark:hover:bg-gray-700 divide-x divide-gray-200"
            >
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.date}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.department_name}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.content}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.supplier_name}</td>
              <td className={`${bill.state ? "text-green-500" : "text-red-500"} px-3 py-3.5 text-center text-sm font-semibold text-gray-900`}>{bill.state ? "收入" : "支出"}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.amount}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.invoice}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.remark}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">{bill.first_name}</td>
              <td className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">
                <button
                  className="w-full rounded-md  px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-blue-300"
                  onClick={() => {
                    setSelectItem(bill);
                    setIsOpen(true);
                  }}
                >
                  查看明細
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
