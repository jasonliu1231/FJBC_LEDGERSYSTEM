"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Calendar } from "react-multi-date-picker";

const tutoring = [
  { id: 1, name: "多易" },
  { id: 2, name: "艾思" },
  { id: 3, name: "華而敦" },
  { id: 4, name: "食材" }
];

const def_search = {
  tutoring_list: [1, 2, 3, 4],
  type: 0,
  index: true,
  begin: "",
  end: ""
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [search, setSearch] = useState(def_search);
  const [searchFood, setSearchFood] = useState({});
  const [billList, setBillList] = useState([]);
  const [billDetail, setBillDetail] = useState([]);
  const [query, setQuery] = useState("");

  // 從 HTML 表格中擷取資料
  function getTableData() {
    const table = document.getElementById("myTable");
    const rows = table.querySelectorAll("tbody tr");

    // 提取表格中的資料，只選擇 Name 和 Age 欄位
    const data = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      data.push({
        日期: cells[0].innerText,
        單位: cells[1].innerText,
        品項敘述: cells[2].innerText,
        狀態: cells[3].innerText,
        金額: cells[4].innerText,
        發票: cells[5].innerText
      });
    });

    return data;
  }

  function ExportToExcel({ tableId, fileName }) {
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
        className="mx-1 px-2 py-1 text-sm rounded-md font-semibold text-green-600 ring-1 bg-green-100 ring-green-300"
        onClick={exportTableToExcel}
      >
        下載 Excel
      </button>
    );
  }

  async function submitReview(id) {
    const config = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
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
      body: JSON.stringify({ id: id, finish: bool })
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
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(search)
    };
    let api = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/accountant/list`;
    const response = await fetch(api, config);
    const res = await response.json();
    if (response.ok) {
      setBillList(res);
    } else {
      const msg = error(response.status, res);
      alert(msg);
    }
  }

  async function getFoodDetail() {
    const config = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        clientid: `${localStorage.getItem("client_id")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(searchFood)
    };
    let api = `${process.env.NEXT_PUBLIC_API_URL_8102}/fjbc_tutoring_api/bill/food/detail`;
    const response = await fetch(api, config);
    const res = await response.json();
    if (response.ok) {
      setBillDetail(res);
      setDetailDialog(true);
    } else {
      const msg = error(response.status, res);
      alert(msg);
    }
  }

  useEffect(() => {
    getBill();
  }, [search]);

  const filteredItems =
    query === ""
      ? billList
      : billList.filter((item) => {
          const content = item.content.toLowerCase() || "";
          const invoice = item.invoice?.toLowerCase() || "";
          return content.includes(query.toLowerCase()) || invoice.includes(query.toLowerCase());
        });

  let all_amount = 0;
  let last_amount = 0;
  let current_amount = 0;
  billList.forEach((item) => {
    if (item.finish) {
      if (item.state) {
        last_amount += item.amount;
      } else {
        last_amount -= item.amount;
      }
    } else {
      if (item.state) {
        current_amount += item.amount;
      } else {
        current_amount -= item.amount;
      }
    }
  });
  all_amount = last_amount + current_amount;
  return (
    <>
      {/* 搜尋彈窗 */}
      <Dialog
        open={open}
        onClose={setOpen}
        className="relative z-10"
      >
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <DialogPanel
                transition
                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-[closed]:translate-x-full sm:duration-700"
              >
                <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <DialogTitle className="text-base font-semibold text-gray-900">條件搜尋</DialogTitle>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="absolute -inset-2.5" />
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon
                            aria-hidden="true"
                            className="h-6 w-6"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative mt-6 flex-1 px-4">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900">時間範圍</label>
                      <div className="flex justify-center">
                        {" "}
                        <Calendar
                          value={[search.begin, search.end]}
                          onChange={(value) => {
                            if (value[1]) {
                              setSearch({
                                ...search,
                                begin: value[0].format("YYYY-MM-DD"),
                                end: value[1].format("YYYY-MM-DD")
                              });
                            }
                          }}
                          range
                          rangeHover
                        />
                      </div>
                    </div>
                    <div>
                      {" "}
                      <label className="block text-sm font-medium leading-6 text-gray-900">單位選取</label>
                      {tutoring.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSearch({
                              ...search,
                              tutoring_list: search.tutoring_list.some((i) => i == item.id) ? search.tutoring_list.filter((i) => i != item.id) : [...search.tutoring_list, item.id]
                            });
                          }}
                          className={`${search.tutoring_list.some((i) => i == item.id) ? "ring-red-300" : "ring-gray-300"} m-1 px-3 py-2 text-sm rounded-md font-semibold text-gray-600 ring-2`}
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                    <div className="mx-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900">關鍵字搜尋</label>
                      <input
                        onChange={(event) => setQuery(event.target.value)}
                        value={query}
                        type="text"
                        placeholder="發票、內容"
                        className="px-3 py-2 w-full block rounded-md border-0 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300"
                      />
                    </div>
                    <div className="mx-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSearch(def_search);
                        }}
                        className="mt-2 w-full px-3 py-2 text-sm font-semibold text-blue-300 ring-2 ring-blue-300 hover:bg-blue-500"
                      >
                        重置搜尋
                      </button>
                    </div>

                    <div className="border-t-4 border-red-400 mt-5">
                      <h1 className="text-xl py-2 text-blue-600">食材明細查詢</h1>
                      <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">時間範圍</label>
                        <div className="flex justify-center">
                          {" "}
                          <Calendar
                            value={[searchFood.begin, searchFood.end]}
                            onChange={(value) => {
                              if (value[1]) {
                                setSearchFood({
                                  ...searchFood,
                                  begin: value[0].format("YYYY-MM-DD"),
                                  end: value[1].format("YYYY-MM-DD")
                                });
                              }
                            }}
                            range
                            rangeHover
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          getFoodDetail();
                        }}
                        className="mt-2 w-full px-3 py-2 text-sm font-semibold text-red-300 ring-2 ring-pink-300 hover:bg-red-500"
                      >
                        搜尋食材明細
                      </button>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </div>
        </div>
      </Dialog>
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
      <div className="container mx-auto p-2 sm:p-4">
        <div className="mx-auto px-2 py-2 flex justify-between items-end">
          <h1 className="sm:text-2xl font-semibold leading-6 text-gray-900">零用金</h1>

          <div className="flex items-end">
            <h3 className={`text-sm font-semibold mx-2 min-w-20`}>
              <div className="text-right flex justify-between">
                <span>已確認餘額：</span>
                <span className={`${last_amount < 0 ? "text-red-500" : "text-green-500"}`}>{last_amount || 0}</span>
              </div>
              <div className="text-right border-b-2 border-gray-700 flex justify-between">
                <span>未確認餘額：</span>
                <span className={`${current_amount < 0 ? "text-red-500" : "text-green-500"}`}>{current_amount || 0}</span>
              </div>
              <div className="text-right flex justify-between">
                <span>總餘額：</span>
                <span className={`${all_amount < 0 ? "text-red-500" : "text-green-500"}`}>{all_amount || 0}</span>
              </div>
            </h3>

            <div>
              <ExportToExcel />
              <button
                type="button"
                onClick={() => {
                  setOpen(true);
                }}
                className="px-2 py-1 text-sm rounded-md font-semibold text-sky-600 ring-1 bg-sky-100 ring-sky-300"
              >
                搜尋列表
              </button>
            </div>
          </div>
        </div>

        <div className="">
          <table
            id="myTable"
            className="min-w-full divide-y divide-gray-300"
          >
            <thead className="bg-gray-50 sticky top-0">
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
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-blue-300 cursor-pointer"
                >
                  日期
                </th>
                <th
                  onClick={() => {
                    if (search.type == 2) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 2,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-blue-300 cursor-pointer"
                >
                  單位
                </th>
                <th
                  onClick={() => {
                    if (search.type == 3) {
                      setSearch({
                        ...search,
                        index: !search.index
                      });
                    } else {
                      setSearch({
                        ...search,
                        type: 3,
                        index: true
                      });
                    }
                  }}
                  scope="col"
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-blue-300 cursor-pointer"
                >
                  品項敘述
                </th>
                <th
                  // onClick={() => {
                  //   if (search.type == 3) {
                  //     setSearch({
                  //       ...search,
                  //       index: !search.index
                  //     });
                  //   } else {
                  //     setSearch({
                  //       ...search,
                  //       type: 3,
                  //       index: true
                  //     });
                  //   }
                  // }}
                  scope="col"
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900"
                >
                  備註
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
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-blue-300 cursor-pointer text-right"
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
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-blue-300 cursor-pointer"
                >
                  金額
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
                  className="px-3 py-4 text-left text-sm font-semibold text-gray-900 hover:bg-blue-300 cursor-pointer"
                >
                  發票
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{tutoring.filter((i) => i.id == bill.tutoring_id)[0].name}</td>
                  <td className="px-3 py-4 text-sm font-medium text-gray-900">
                    <span
                      onClick={() => {
                        getBillDetail(bill, 1);
                      }}
                      className={`text-blue-400 cursor-pointer`}
                    >
                      {" "}
                      {bill.content}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm font-medium text-gray-900">{bill.remark}</td>
                  <td className={`${bill.state ? "text-green-500" : "text-red-500"} whitespace-nowrap px-3 py-4 text-sm text-right`}>{bill.state ? "收入" : "支出"}</td>
                  <td className={`${bill.state ? "text-green-500" : "text-red-500"} whitespace-nowrap px-3 py-4 text-sm text-left`}>{bill.amount}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{bill.invoice}</td>
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
                          <div>{new Date(bill.update_at).toLocaleTimeString()}</div>
                          {/* <div>經手人：{bill.first_name}</div> */}
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
      </div>
    </>
  );
}
