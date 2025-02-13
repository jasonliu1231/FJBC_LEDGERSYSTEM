"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";

export default function Example() {
  const invoice_id = useRef();
  const [data, setData] = useState();
  const [refund, setRefund] = useState([]);
  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState({ payment_method: 1, payment_description: "", payment_description1: "" });

  async function getInvoice(id) {
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/${id}`, config);
    const res = await response.json();
    if (response.ok) {
      setData(res);
    } else {
      const msg = error(response.status, res);
      setInfo({
        show: true,
        success: false,
        msg: "錯誤" + msg
      });
    }
  }

  async function getRefund(id) {
    const config = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      }
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/refund/marge/${id}`, config);
    const res = await response.json();
    if (response.ok) {
      setRefund(res);
    } else {
      const msg = error(response.status, res);
      setInfo({
        show: true,
        success: false,
        msg: "錯誤" + msg
      });
    }
  }

  async function updateInvoice() {
    const config = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(update)
    };
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/tutoring/student/invoice/update_payment`, config);
    const res = await response.json();
    if (response.ok) {
      getInvoice(invoice_id.current);
      setOpen(false);
    } else {
      const msg = error(response.status, res);
      setInfo({
        show: true,
        success: false,
        msg: "錯誤" + msg
      });
    }
  }

  useEffect(() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const id = Number(params.get("id"));
    invoice_id.current = id;
    getInvoice(id);
    getRefund(id);
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {}}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center items-center p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in my-8 w-full max-w-xl p-6 data-[closed]:translate-y-0 data-[closed]:scale-95"
            >
              <div className="flex justify-center">
                <span className="isolate inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => {
                      setUpdate({
                        ...update,
                        payment_method: 1,
                        payment_description: "",
                        payment_description1: ""
                      });
                    }}
                    type="button"
                    className={`${
                      update.payment_method == 1 ? "bg-pink-200" : "bg-white"
                    } relative inline-flex items-center rounded-l-md px-6 py-4 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10`}
                  >
                    現金
                  </button>
                  <button
                    onClick={() => {
                      setUpdate({
                        ...update,
                        payment_method: 2,
                        payment_description1: ""
                      });
                    }}
                    type="button"
                    className={`${
                      update.payment_method == 2 ? "bg-pink-200" : "bg-white"
                    } relative -ml-px inline-flex items-center px-6 py-4 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10`}
                  >
                    轉帳
                  </button>
                  <button
                    onClick={() => {
                      setUpdate({
                        ...update,
                        payment_method: 3
                      });
                    }}
                    type="button"
                    className={`${
                      update.payment_method == 3 ? "bg-pink-200" : "bg-white"
                    } relative -ml-px inline-flex items-center rounded-r-md px-6 py-4 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10`}
                  >
                    信用卡
                  </button>
                </span>
              </div>
              {update.payment_method != 1 && (
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">驗證碼1</label>
                  <div className="mt-2">
                    <input
                      value={update.payment_description || ""}
                      onChange={(e) => {
                        setUpdate({
                          ...update,
                          payment_description: e.target.value
                        });
                      }}
                      type="text"
                      className="pl-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                    />
                  </div>
                </div>
              )}
              {update.payment_method == 3 && (
                <div>
                  <label className="block text-sm/6 font-medium text-gray-900">驗證碼2</label>
                  <div className="mt-2">
                    <input
                      value={update.payment_description1 || ""}
                      onChange={(e) => {
                        setUpdate({
                          ...update,
                          payment_description1: e.target.value
                        });
                      }}
                      type="text"
                      className="pl-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                    />
                  </div>
                </div>
              )}
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                  }}
                  className="mx-2 inline-flex justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateInvoice();
                  }}
                  className="mx-2 inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  送出
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <div className="container mx-auto">
        <div className="mx-auto py-2">
          <h1 className="text-lg font-semibold text-gray-900">繳費明細查詢</h1>
        </div>
        <main className="mx-auto grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <h2 className="text-lg font-medium text-gray-900">基本資料</h2>
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm text-gray-900">
              <div className="divide-y divide-gray-200">
                <div className="px-2 py-3">
                  <div className="flex justify-between">
                    <div className="">{data?.tutoring.tutoring_name}</div>
                    <div className="text-sm text-gray-500">{data?.tutoring.tel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{data?.tutoring.registration_name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{data?.tutoring.registration_no}</div>
                  </div>
                </div>

                <div className="px-2 py-3">
                  <div className="grid grid-cols-3">
                    <div className="col-span-1 row-cols-2">
                      <img
                        src={data?.student.user.photo}
                        width={100}
                      />
                    </div>
                    <div className="">{data?.student.user.first_name}</div>
                    <div className="text-gray-500">{data?.student.user.nick_name}</div>
                    <div className="">{data?.student.school?.school_name || ""}</div>
                    <div className="text-gray-500">{data?.student.grade?.grade_name || ""}</div>
                  </div>
                </div>

                <div className="flex px-2 py-3">
                  <div className="text-lg">{data?.school_year} 學年度</div>
                  <div className="text-lg ml-4 text-gray-500">{data?.start_month} 月</div>
                  {data?.start_month == data?.end_month || (
                    <>
                      <div className="text-lg mx-4 text-gray-500"> 至 </div>
                      <div className="text-lg text-gray-500">{data?.end_month} 月</div>
                    </>
                  )}
                </div>

                <div className="flex px-2 py-3">
                  <div className="text-lg">開立日期：</div>
                  <div className="text-lg text-gray-500">{new Date(data?.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex px-2 py-3">
                  <div className="text-lg">繳費日期：</div>
                  <div className="text-lg text-gray-500">{data?.charge_date}</div>
                </div>

                <div className="flex px-2 py-3">
                  <div className="text-lg">繳費期限：</div>
                  <div className="text-lg text-gray-500">{data?.deadline}</div>
                </div>

                <div className="flex px-2 py-3 items-center">
                  <div
                    onClick={() => {
                      setUpdate({
                        ...update,
                        tutoring_student_invoice_id: invoice_id.current
                      });
                      setOpen(true);
                    }}
                    className="w-12 text-blue-400 cursor-pointer hover:text-blue-600"
                  >
                    修改
                  </div>
                  <div className="text-lg w-1/2">
                    繳費方式： <span className="text-lg text-gray-500">{data?.payment_method == 1 ? "現金" : data?.payment_method == 2 ? "轉帳" : data?.payment_method == 3 ? "信用卡" : "其他"}</span>
                  </div>
                  <div className="text-lg flex items-center">
                    驗證碼：
                    <div className="">
                      <div className="text-lg text-gray-500">{data?.payment_description}</div>
                      <div className="text-lg text-gray-500">{data?.payment_description1}</div>
                    </div>
                  </div>
                </div>

                <div className="flex px-2 py-3 items-end">
                  <div className="text-lg w-1/2">
                    建立人： <span className="text-lg text-gray-500">{data?.creator?.first_name}</span>
                  </div>
                  <div className="text-lg w-1/2">
                    收款人： <span className="text-lg text-gray-500">{data?.handler?.first_name}</span>
                  </div>
                </div>

                {data?.reason && (
                  <div className="flex px-2 py-3">
                    <div className="text-lg">註銷原因：</div>
                    <div className="text-lg text-gray-500">{data?.reason}</div>
                  </div>
                )}

                {data?.reject && (
                  <div className="flex px-2 py-3">
                    <div className="text-lg">財務註銷原因：</div>
                    <div className="text-lg text-gray-500">{data?.reject}</div>
                  </div>
                )}

                <div className="px-2 py-3">
                  <div
                    dangerouslySetInnerHTML={{ __html: data?.remark }}
                    className="prose"
                  />
                </div>
                <div className="flex px-2 py-3"></div>
              </div>
            </div>
          </div>
          <div className="">
            <h2 className="text-lg font-medium text-gray-900">金額明細</h2>

            <div className="rounded-lg border border-gray-200 bg-white shadow-sm text-gray-900">
              <ul
                role="list"
                className="divide-y divide-gray-200"
              >
                {data?.invoice_detail_list.map((subject, index) => {
                  let unit = "";
                  switch (subject.unit) {
                    case 1:
                      unit = "堂";
                      break;
                    case 2:
                      unit = "週";
                      break;
                    case 3:
                      unit = "月";
                      break;
                    case 4:
                      unit = "季";
                      break;
                    case 5:
                      unit = "學期";
                      break;
                  }
                  return (
                    <li
                      key={subject.id}
                      className="px-2 py-3 px-6"
                    >
                      <div className="flex justify-between">
                        <div className="text-lg">{subject.name}</div>
                        <div className="flex">
                          <div className="text-sm text-gray-500">{subject.count}</div>
                          <div className="text-sm text-gray-500">{unit}</div>
                        </div>
                        <div className="text-sm text-gray-500">${subject.money}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <dl className="space-y-6 border-t border-gray-200 px-2 py-3 px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm">教材費</dt>
                  <dd className="text-sm font-medium text-gray-900">${data?.textbook}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">餐費</dt>
                  <dd className="text-sm font-medium text-gray-900">${data?.meal}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">交通費</dt>
                  <dd className="text-sm font-medium text-gray-900">${data?.transportation}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">訂金折抵</dt>
                  <dd className="text-sm font-medium text-red-500">-${data?.deposit}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">優惠券折抵</dt>
                  <dd className="text-sm font-medium text-red-500">-${data?.coupon}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">折扣項目</dt>
                  <dd className="text-sm font-medium text-red-500">-${data?.discount}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-medium">總計</dt>
                  <dd className="text-base font-medium text-gray-900">
                    $
                    {data?.invoice_detail_list.reduce((total, item) => {
                      return total + item.money;
                    }, 0) +
                      data?.textbook +
                      data?.meal +
                      data?.transportation -
                      data?.deposit -
                      data?.coupon -
                      data?.discount}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          {refund.refund_list?.length > 0 && (
            <div className="">
              <h2 className="text-lg font-medium text-gray-900">退款</h2>

              <div className="rounded-lg border border-gray-200 bg-white shadow-sm text-gray-900">
                <ul
                  role="list"
                  className="divide-y divide-gray-200"
                >
                  {refund.refund_list?.map((item, index) => {
                    let unit = "";
                    switch (item.unit) {
                      case 1:
                        unit = "堂";
                        break;
                      case 2:
                        unit = "週";
                        break;
                      case 3:
                        unit = "月";
                        break;
                      case 4:
                        unit = "季";
                        break;
                      case 5:
                        unit = "學期";
                        break;
                    }
                    return (
                      <li
                        key={item.id}
                        className="p-2"
                      >
                        <div className="grid grid-cols-2 text-sm">
                          <div className="col-span-2 text-blue-400 mb-3">
                            退款月份：{item.start_month}~{item.end_month}
                          </div>

                          {item.course_name && (
                            <div>
                              {item.course_name}:{item.total_course_refund_money}
                            </div>
                          )}
                          {item.total_meal_refund != 0 && (
                            <div>
                              餐費:<span className="text-xs text-red-400">{item.total_meal_refund}</span>
                            </div>
                          )}
                          {item.total_textbook_refund != 0 && (
                            <div>
                              教材費:<span className="text-xs text-red-400">{item.total_textbook_refund}</span>
                            </div>
                          )}
                          {item.total_transportation_refund != 0 && (
                            <div>
                              教材費:<span className="text-xs text-red-400">{item.total_transportation_refund}</span>
                            </div>
                          )}
                          {item.refund_reason && (
                            <div className="col-span-2">
                              原由:<span className="text-xs text-red-400">{item.refund_reason}</span>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4 border-t-4 px-2 text-md">
                  <div>總學費：{refund.total_course_refund_money}</div>
                  <div>總餐費：{refund.total_meal_refund}</div>
                  <div>總教材費：{refund.total_textbook_refund}</div>
                  <div>總交通費：{refund.total_transportation_refund}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
