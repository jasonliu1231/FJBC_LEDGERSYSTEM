"use client";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import * as XLSX from "xlsx";

export default function Home() {
  const [items, setItems] = useState([]);
  const [student, setStudent] = useState("");
  const [open, setOpen] = useState(false);
  const [reject, setReject] = useState("");
  const [info, setInfo] = useState({});

  const filteredDeposit =
    student === ""
      ? items
      : items.filter((item) => {
          const name = item.student.user.first_name;
          return name.toLowerCase().includes(student.toLowerCase());
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

  async function newCheck(data) {
    const config = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
    let url = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/deposit/new`;
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      getDeposit();
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

    let url = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/deposit/refund/check`;
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      getDeposit();
      setOpen(false);
    } else {
      alert(res.msg);
    }
  }

  async function getDeposit() {
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/deposit/list/acc`, config);
    const res = await response.json();
    if (response.ok) {
      setItems(res.list);
    } else {
      alert(res.msg);
    }
  }

  useEffect(() => {
    getDeposit();
  }, []);

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
                    if (info.is_refund) {
                      refundCheck({
                        deposit_id: info.deposit_id,
                        refund_approved: info.refund_approved,
                        refund_approved_reject: reject
                      });
                    } else {
                      newCheck({
                        deposit_id: info.deposit_id,
                        approved_status: info.approved_status,
                        approved_reject: reject
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
      <div className="container mx-auto p-2 sm:p-4">
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

          {/* <span className="col-span-2 isolate inline-flex">
            <ExportToExcel />
            <div className="flex items-center">
              <span className="text-red-500 mr-2">推播</span>
              <Switch
                checked={enabled}
                onChange={setEnabled}
                className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
              >
                <span className="sr-only">Use setting</span>
                <span className="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in group-data-[checked]:opacity-0 group-data-[checked]:duration-100 group-data-[checked]:ease-out"
                  >
                    <svg
                      fill="none"
                      viewBox="0 0 12 12"
                      className="h-3 w-3 text-gray-400"
                    >
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex h-full w-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-[checked]:opacity-100 group-data-[checked]:duration-200 group-data-[checked]:ease-in"
                  >
                    <svg
                      fill="currentColor"
                      viewBox="0 0 12 12"
                      className="h-3 w-3 text-indigo-600"
                    >
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </Switch>
            </div>
          </span> */}
        </div>

        <div className="relative mt-6 flex-1">
          {items ? (
            <table className="min-w-full divide-y divide-gray-300 bg-white">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    單位
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    學生姓名
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    訂金
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    退款
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    狀態
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    原因
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    備註
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    建立時間
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-left text-sm font-semibold text-gray-900"
                  >
                    建立人
                  </th>
                  <th
                    scope="col"
                    className="p-2 text-center text-sm font-semibold text-gray-900 w-1/12"
                  >
                    審核
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white h-80vh overflow-auto">
                {filteredDeposit.map((item, index) => {
                  const str = item.deposit_state.split("")[0];
                  let state = "";
                  let rejectMsg = "";
                  let type = "";

                  if (item.deposit_state == "12") {
                    state = "已拒絕";
                    rejectMsg = item.approved_reject;
                    type = "bg-red-50 text-red-700 ring-red-600/50";
                  } else if (item.deposit_state == "13") {
                    state = "已註銷";
                    rejectMsg = item.reason;
                    type = "bg-pink-50 text-pink-700 ring-pink-600/50";
                  } else if (item.deposit_state == "11") {
                    state = "已審核";
                    type = "bg-green-50 text-green-700 ring-green-600/50";
                  } else if (item.deposit_state == "10") {
                    state = "未審核";
                    type = "bg-yellow-50 text-yellow-700 ring-yellow-600/50";
                  } else if (item.deposit_state == "20") {
                    state = "退款未審核";
                    rejectMsg = item.refund_reason;
                    type = "bg-yellow-50 text-yellow-700 ring-yellow-600/50";
                  } else if (item.deposit_state == "21") {
                    state = "退款已審核";
                    type = "bg-green-50 text-green-700 ring-green-600/50";
                  } else if (item.deposit_state == "22") {
                    state = "退款已拒絕";
                    rejectMsg = item.refund_reject;
                    type = "bg-red-50 text-red-700 ring-red-600/50";
                  }

                  return (
                    <tr
                      key={index}
                      className={`hover:bg-sky-200`}
                    >
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{item.tutoring.short_name}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{item.student.user.first_name}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{item.deposit || 0}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{item.refund_deposit || 0}</td>

                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">
                        <span className={`${type} inline-flex items-center rounded-full p-2 text-xs font-medium ring-1 ring-inset`}>{state}</span>
                      </td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{rejectMsg}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">
                        <div
                          dangerouslySetInnerHTML={{ __html: item.remark }}
                          className="prose"
                        />
                      </td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">{item.creator.first_name}</td>
                      <td className="whitespace-nowrap p-2 text-sm text-gray-500">
                        {(item.deposit_state == "10" || item.deposit_state == "20") && (
                          <>
                            <button
                              onClick={() => {
                                if (str == 1) {
                                  newCheck({
                                    deposit_id: item.id,
                                    approved_status: true
                                  });
                                } else if (str == 2) {
                                  refundCheck({
                                    deposit_id: item.id,
                                    refund_approved: true
                                  });
                                }
                              }}
                              type="button"
                              className={`bg-gray-600 px-2 py-1 rounded-md mx-1 relative inline-flex items-center text-white hover:bg-gray-400`}
                            >
                              確認
                            </button>
                            <button
                              onClick={() => {
                                if (str == 1) {
                                  setInfo({
                                    is_refund: false,
                                    deposit_id: item.id,
                                    approved_status: false
                                  });
                                } else if (str == 2) {
                                  setInfo({
                                    is_refund: true,
                                    deposit_id: item.id,
                                    refund_approved: false
                                  });
                                }

                                setOpen(true);
                              }}
                              type="button"
                              className={`bg-red-600 px-2 py-1 rounded-md mx-1 relative inline-flex items-center text-white hover:bg-red-400`}
                            >
                              註銷
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
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
    </>
  );
}
