"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { Switch } from "@headlessui/react";
import * as XLSX from "xlsx";

const tutoring = [
  { id: 1, name: "多易" },
  { id: 2, name: "艾思" },
  { id: 3, name: "華而敦" }
];

const today = new Date();
const def_start = new Date(today.setDate(today.getDate() - 7));

export default function Home() {
  const data = useRef();
  const [alertData, setAlertData] = useState([]);
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState({});
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [student, setStudent] = useState("");
  const [tutoringId, setTutoringId] = useState(0);
  const [payment_method, setPayment_method] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [reject, setReject] = useState("");

  const filteredItems =
    student === ""
      ? items
      : items.filter((item) => {
          const name = item.first_name.toLowerCase() || "";
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
        收費月份: cells[4].innerText,
        繳費日期: cells[5].innerText,
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
      XLSX.writeFile(workbook, `${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_Bill.xlsx`);
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

  async function invoiceCheck(data) {
    const config = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
    let url = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/approve_invoice`;
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      getPaymentDetail();
      setOpen(false);
    } else {
      alert(res.msg);
    }
  }

  async function refundCheck(data) {
    const config = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };

    let url = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/refund_check`;
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      getPaymentDetail();
      setOpen(false);
    } else {
      alert(res.msg);
    }
  }

  async function getPaymentDetail() {
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    let url = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/approve-show?`;
    if (start != "") {
      url += `start_date=${start}&`;
    }
    if (end != "") {
      url += `end_date=${end}&`;
    }
    if (tutoringId != 0) {
      url += `tutoring_id=${tutoringId}&`;
    }
    if (payment_method != 0) {
      url += `payment_method=${payment_method}`;
    }
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      setAmount(res);
      setItems(res.approve_list);
    } else {
      alert(res.msg);
    }
  }
  useEffect(() => {
    getPaymentDetail();
  }, [start, end, tutoringId, payment_method]);

  return (
    <>
      <Dialog
        open={open}
        onClose={setOpen}
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
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-sm sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900"
                  >
                    註銷原因
                  </DialogTitle>
                  <div className="mt-2">
                    <input
                      value={reject}
                      onChange={(e) => {
                        setReject(e.target.value);
                      }}
                      type="text"
                      className="p-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => {
                    const item = data.current;

                    if (item.is_refund) {
                      refundCheck({ id: item.invoice_refund_id, refund_status: false, refund_reject: reject });
                    } else {
                      invoiceCheck({
                        id: item.invoice_id,
                        approve: false,
                        reject: reject
                      });
                    }
                  }}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  確認
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <div className="container mx-auto p-2">
        <div className="grid grid-cols-12 gap-x-1">
          <div className="col-span-1 text-xl font-semibold text-gray-900">繳費紀錄</div>
          <div className="col-span-2">
            <input
              value={student}
              onChange={(e) => {
                setStudent(e.target.value);
              }}
              type="text"
              placeholder="學生姓名"
              className="px-3 w-full rounded-md border-0 p-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
            />
          </div>
          <div className="col-span-2">
            <input
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
              }}
              type="date"
              className="px-3 w-full rounded-md border-0 p-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
            />
          </div>
          <div className="col-span-2">
            <input
              value={end}
              onChange={(e) => {
                setEnd(e.target.value);
              }}
              type="date"
              className="px-3 w-full rounded-md border-0 p-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
            />
          </div>
          <div className="col-span-4">
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
            <span className="isolate inline-flex rounded-md shadow-sm mx-1">
              <button
                onClick={() => {
                  setPayment_method(0);
                }}
                type="button"
                className={`${
                  payment_method == 0 ? "ring-2 ring-red-300" : "ring-1 ring-gray-300"
                } ring-inset relative inline-flex items-center bg-white rounded-l-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
              >
                不限
              </button>
              <button
                onClick={() => {
                  setPayment_method(1);
                }}
                type="button"
                className={`${
                  payment_method == 1 ? "ring-2 ring-red-300" : "ring-1 ring-gray-300"
                } ring-inset relative inline-flex items-center bg-white p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
              >
                現金
              </button>
              <button
                onClick={() => {
                  setPayment_method(2);
                }}
                type="button"
                className={`${
                  payment_method == 2 ? "ring-2 ring-red-300" : "ring-1 ring-gray-300"
                } ring-inset relative inline-flex items-center bg-white p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
              >
                轉帳
              </button>
              <button
                onClick={() => {
                  setPayment_method(3);
                }}
                type="button"
                className={`${
                  payment_method == 3 ? "ring-2 ring-red-300" : "ring-1 ring-gray-300"
                } ring-inset relative inline-flex items-center bg-white rounded-r-md p-2 text-sm font-semibold text-gray-900  hover:bg-gray-50 focus:z-10`}
              >
                信用卡
              </button>
            </span>
          </div>
          <div className="col-span-1">
            <ExportToExcel />
          </div>
        </div>

        <div className="grid grid-cols-4 mt-6 text-gray-900">
          <div className="col-span-1 p-2 mx-2 rounded-md font-bold bg-white border-2 border-purple-300">現金：{amount.payment_1?.toLocaleString()}</div>
          <div className="col-span-1 p-2 mx-2 rounded-md font-bold bg-white border-2 border-purple-300">轉帳：{amount.payment_2?.toLocaleString()}</div>
          <div className="col-span-1 p-2 mx-2 rounded-md font-bold bg-white border-2 border-purple-300">信用卡：{amount.payment_3?.toLocaleString()}</div>
          <div className="col-span-1 p-2 mx-2 rounded-md font-bold bg-white border-2 border-purple-300">總計：{amount.payment_totals?.toLocaleString()}</div>
        </div>
        <div className="relative mt-6 flex-1">
          {items ? (
            <table
              id="myTable"
              className="min-w-full divide-y divide-gray-300"
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
                    className="p-2 text-sm font-semibold text-gray-900 text-center"
                  >
                    收退方式
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-center"
                  >
                    收費月份
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-center"
                  >
                    繳費日期
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    學費
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    教材費
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    餐費
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    交通費
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    折扣
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    優惠券
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    訂金
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-right"
                  >
                    實收
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-sm font-semibold text-gray-900 text-center "
                  >
                    原因
                  </th>
                  <th
                    scope="col"
                    className="relative w-1/4"
                  >
                    <span className="sr-only">確認</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredItems.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-100"
                  >
                    <td className={`${item.is_refund ? "text-red-500" : "text-green-500"} whitespace-nowrap p-2 text-sm`}>{item.is_refund ? "退費" : "收費"}</td>
                    <td className="whitespace-nowrap p-2 text-sm font-medium text-gray-900">{tutoring.filter((i) => i.id == item.tutoring_id)[0].name}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500">
                      <a
                        className="text-blue-400"
                        href={`/admin/invoice?id=${item.invoice_id}`}
                      >
                        {item.first_name}
                      </a>
                    </td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">
                      {item.payment_method == 1 ? "現金" : item.payment_method == 2 ? "轉帳" : item.payment_method == 3 ? "信用卡" : "其他"}
                    </td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">
                      {item.start_month}~{item.end_month}
                    </td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-center">{new Date(item.charge_date).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.course_money.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.textbook.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.meal.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.transportation.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.discount.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.coupon.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.deposit.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.total.toLocaleString()}</td>
                    <td className="whitespace-nowrap p-2 text-sm text-gray-500 text-right">{item.reject}</td>
                    <td className="relative text-gray-500 p-2 text-right text-sm font-medium">
                      {item.reject ? null : item.checkmoney ? (
                        <span className="whitespace-nowrap">{new Date(item.checkmoney).toLocaleString()}</span>
                      ) : (
                        <button
                          onClick={() => {
                            data.current = item;
                            setAlertData(item);
                            if (item.is_refund) {
                              refundCheck({ id: item.invoice_refund_id, refund_status: true });
                            } else {
                              invoiceCheck({
                                id: item.invoice_id,
                                approve: true
                              });
                            }
                          }}
                          type="button"
                          className={`bg-gray-600 px-2 py-1 rounded-md mx-1 relative inline-flex items-center text-white hover:bg-gray-400`}
                        >
                          確認
                        </button>
                      )}
                      {item.reject ? (
                        <span className="text-pink-400">{item.reject}</span>
                      ) : (
                        <button
                          onClick={() => {
                            data.current = item;
                            setAlertData(item);
                            setOpen(true);
                          }}
                          type="button"
                          className={`bg-red-600 px-2 py-1 rounded-md mx-1 relative inline-flex items-center text-white hover:bg-red-400`}
                        >
                          註銷
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex justify-center">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
