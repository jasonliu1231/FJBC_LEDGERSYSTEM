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
