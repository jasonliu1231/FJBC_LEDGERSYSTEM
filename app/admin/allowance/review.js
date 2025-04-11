"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Calendar } from "react-multi-date-picker";

export default function Home() {
  const [detailDialog, setDetailDialog] = useState(false);
  const [search, setSearch] = useState({});
  const [billList, setBillList] = useState([]);
  const [createUserList, setCreateUserList] = useState([]);
  const [createAmountList, setCreateAmountList] = useState([]);
  const [billDetail, setBillDetail] = useState([]);
  const [createUser, setCreateUser] = useState(0);

  async function submitReview(id) {
    const config = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bill_id: id })
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/accountant/reject`, config);
    const res = await response.json();
    if (response.ok) {
      getBill();
    } else {
      const msg = error(response.status, res);
      alert(msg);
    }
  }

  async function submitFinish(id, bool) {
    const config = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bill_id: id, finish: bool })
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/accountant/finish`, config);
    const res = await response.json();
    if (response.ok) {
      getBill();
    } else {
      const msg = error(response.status, res);
      alert(msg);
    }
  }

  async function getBillDetail(bill, type) {
    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: bill.id })
    };
    let api = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/detail`;
    const response = await fetch(api, config);
    const res = await response.json();
    if (response.ok) {
      if (type == 1) {
        setBillDetail(res);
        setDetailDialog(true);
      } else if (type == 2) {
        setUpdateData({
          entity: bill,
          detail: res
        });
        setUpdateDialog(true);
      }
    } else {
      const msg = error(response.status, res);
      alert(msg);
    }
  }

  async function getBill() {
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    let api = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/accountant/list`;
    const response = await fetch(api, config);
    const res = await response.json();
    if (response.ok) {
      setBillList(res.bill_list);
      setCreateUserList(res.create_list);
      setCreateAmountList(res.create_amount);
    } else {
      alert(msg);
    }
  }

  useEffect(() => {
    getBill();
  }, []);
  // 審核列表
  const filteredItems = createUser === 0 ? billList : billList.filter((item) => item.create_by == createUser);
  // 送審人總和
  const filteredUserAmount = createUser === 0 ? createAmountList : createAmountList.filter((item) => item.create_by == createUser);
  const last_amount = filteredUserAmount.reduce((all, item) => all + item.finish, 0);
  const current_amount = filteredUserAmount.reduce((all, item) => all + item.no_finish, 0);
  const all_amount = filteredUserAmount.reduce((all, item) => all + item.no_finish + item.finish, 0);

  return (
    <>
      {/* 明細彈窗 */}
      <Dialog
        open={detailDialog}
        onClose={() => {}}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-xl sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div>
                <div className="mt-3 sm:mt-5">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          日期
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          商品名稱
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          小計
                        </th>
                        <th
                          scope="col"
                          className="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          單位
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {billDetail.length > 0 ? (
                        billDetail.map((item, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{item.date}</td>
                            <td className="px-2 py-2 text-sm text-gray-500">{item.content}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{item.money}</td>
                            <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{item.unit}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="whitespace-nowrap px-2 py-2 text-xl text-center text-gray-500"
                          >
                            無明細
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500"></td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">總金額：</td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">{billDetail.reduce((all, item) => all + item.money, 0)}</td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setDetailDialog(false);
                  }}
                  className="mx-2 px-3 py-2 text-sm font-semibold text-red-400 ring-2 ring-pink-400 hover:bg-red-100"
                >
                  關閉
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <div className="">
        <div className="mx-auto px-2 py-2 flex justify-between items-center">
          <div className="flex">
            <h1 className="text-2xl font-semibold text-gray-900">零用金審核</h1>
            <select
              className="w-40 ring-1 rounded-md mx-2 text-gray-600"
              onChange={(e) => {
                setCreateUser(Number(e.target.value));
              }}
            >
              <option value={0}>全選</option>
              {createUserList.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.first_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <h3 className={`text-sm font-semibold mx-2 min-w-20`}>
              <div className="text-right flex justify-between">
                <span>已確認金額：</span>
                <span className={`${last_amount < 0 ? "text-red-500" : "text-green-500"}`}>{last_amount || 0}</span>
              </div>
              <div className="text-right border-b-2 border-gray-700 flex justify-between">
                <span>未確認金額：</span>
                <span className={`${current_amount < 0 ? "text-red-500" : "text-green-500"}`}>{current_amount || 0}</span>
              </div>
              <div className="text-right flex justify-between">
                <span>總餘額：</span>
                <span className={`${all_amount < 0 ? "text-red-500" : "text-green-500"}`}>{all_amount || 0}</span>
              </div>
            </h3>
          </div>
        </div>

        <table
          id="myTable"
          className="min-w-full divide-y divide-gray-300"
        >
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                日期
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                單位
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                品項敘述
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                備註
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900 text-right"
              >
                狀態
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                金額
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                發票
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                經辦人
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
              >
                設定
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredItems.map((bill, index) => (
              <tr
                key={index}
                className={`${bill.finish ? "bg-gray-300" : "bg-white"}`}
              >
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(bill.date).toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{bill.department_name}</td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">
                  <span
                    onClick={() => {
                      getBillDetail(bill, 1);
                    }}
                    className={`text-blue-400 cursor-pointer`}
                  >
                    {bill.content}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">{bill.remark}</td>
                <td className={`${bill.state ? "text-green-500" : "text-red-500"} whitespace-nowrap px-3 py-4 text-sm text-right`}>{bill.state ? "收入" : "支出"}</td>
                <td className={`${bill.state ? "text-green-500" : "text-red-500"} whitespace-nowrap px-3 py-4 text-sm text-left`}>{bill.amount}</td>
                <td className="px-3 py-4 text-sm font-medium text-gray-900">{bill.invoice}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{bill.first_name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm flex items-center">
                  {bill.finish ? (
                    <>
                      <div
                        onClick={() => {
                          submitFinish(bill.id, false);
                        }}
                        className="text-orange-600 hover:text-orange-300 cursor-pointer ring-2 ring-orange-400 px-1 mx-1 h-5"
                      >
                        取消
                      </div>
                      <div className="text-gray-600 mx-1">
                        <div>{new Date(bill.update_at).toLocaleDateString()}</div>
                        {/* <div>{new Date(bill.update_at).toLocaleTimeString()}</div> */}
                        <div>經手人：{bill.first_name}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => {
                          submitReview(bill.id);
                        }}
                        className="text-red-600 hover:text-red-300 cursor-pointer ring-2 ring-red-400 px-1 mx-1"
                      >
                        退回
                      </div>
                      <div
                        onClick={() => {
                          submitFinish(bill.id, true);
                        }}
                        className="text-green-600 hover:text-green-300 cursor-pointer ring-2 ring-green-400 px-1 mx-1"
                      >
                        確認
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
