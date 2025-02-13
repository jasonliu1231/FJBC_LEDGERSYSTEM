"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// 註冊必需的 Chart.js 組件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
// 圖表的選項
const options = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "top" // 圖例位置
    },
    title: {
      display: true,
      text: "補習班日收表" // 圖表標題
    }
  }
};

export default function Home() {
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [dateRange, setDateRange] = useState([]);
  const [selected, setSelected] = useState(0);

  const tutoringEvents = selected == 0 ? data : data.filter((i) => i.tutoring_id == selected);
  const t1 = dateRange.map((i) => {
    let val = 0;
    tutoringEvents.forEach((j) => {
      if (j.tutoring_id == 1 && new Date(i).toLocaleDateString() == new Date(j.charge_date).toLocaleDateString()) {
        val = Number(j.total);
      }
    });
    return val;
  });
  const t2 = dateRange.map((i) => {
    let val = 0;
    tutoringEvents.forEach((j) => {
      if (j.tutoring_id == 2 && new Date(i).toLocaleDateString() == new Date(j.charge_date).toLocaleDateString()) {
        val = Number(j.total);
      }
    });
    return val;
  });
  const t3 = dateRange.map((i) => {
    let val = 0;
    tutoringEvents.forEach((j) => {
      if (j.tutoring_id == 3 && new Date(i).toLocaleDateString() == new Date(j.charge_date).toLocaleDateString()) {
        val = Number(j.total);
      }
    });
    return val;
  });

  function rangeDate(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateArray = [];

    // 生成日期區間
    let currentDate = start;
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate).toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDateRange(dateArray);
  }

  async function getPaymentDetail() {
    const config = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        user_id: localStorage.getItem("user_id")
      }
    };
    let url = `/api/tutoring/pic?start=${start}&end=${end}`;
    const response = await fetch(url, config);
    const res = await response.json();
    if (response.ok) {
      setData(res);
    } else {
      alert(res.msg);
    }
  }

  useEffect(() => {
    if (start != "" && end != "") {
      rangeDate(start, end);
      getPaymentDetail();
    }
  }, [start, end]);

  console.log(data);
  // if (data.length == 0) {
  //   return <div className="spinner mx-auto mt-40"></div>;
  // }

  return (
    <div>
      <div className="flex items-end p-4">
        <span className="isolate inline-flex">
          <button
            type="button"
            onClick={() => {
              setSelected(0);
            }}
            className={`${
              selected == 0 ? "ring-4 ring-blue-300" : "ring-1 ring-gray-300"
            } relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset hover:bg-gray-50 focus:z-10`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(1);
            }}
            className={`${
              selected == 1 ? "ring-4 ring-blue-300" : "ring-1 ring-gray-300"
            } relative inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset hover:bg-gray-50 focus:z-10`}
          >
            多易
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(2);
            }}
            className={`${
              selected == 2 ? "ring-4 ring-blue-300" : "ring-1 ring-gray-300"
            } relative inline-flex items-center bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset hover:bg-gray-50 focus:z-10`}
          >
            艾思
          </button>
          <button
            type="button"
            onClick={() => {
              setSelected(3);
            }}
            className={`${
              selected == 3 ? "ring-4 ring-blue-300" : "ring-1 ring-gray-300"
            } relative inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-inset hover:bg-gray-50 focus:z-10`}
          >
            華而敦
          </button>
        </span>
        <div className="flex mx-4">
          <div className="mx-2">
            <label
              htmlFor="start"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              起始時間
            </label>
            <div className="mt-2">
              <input
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                }}
                id="start"
                name="start"
                type="date"
                className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
          <div className="mx-2">
            <label
              htmlFor="end"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              結束時間
            </label>
            <div className="mt-2">
              <input
                value={end}
                onChange={(e) => {
                  setEnd(e.target.value);
                }}
                id="end"
                name="end"
                type="date"
                className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-2/3 overflow-auto">
        <Line
          data={{
            labels: dateRange,
            datasets: [
              {
                label: "多易",
                data: t1, // 這裡是折線圖的數據
                borderColor: "#00DB00", // 折線的顏色
                backgroundColor: "#79FF79", // 填充顏色
                tension: 0 // 彎曲度
              },
              {
                label: "艾思",
                data: t2, // 這裡是折線圖的數據
                borderColor: "#EA0000", // 折線的顏色
                backgroundColor: "#FF9797", // 填充顏色
                tension: 0 // 彎曲度
              },
              {
                label: "華而敦",
                data: t3, // 這裡是折線圖的數據
                borderColor: "#E800E8", // 折線的顏色
                backgroundColor: "#FF8EFF", // 填充顏色
                tension: 0 // 彎曲度
              }
            ]
          }}
          options={options}
        />
      </div>

      <div className="w-4/5 border-2 m-4 overflow-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="divide-x divide-gray-200">
              <th
                scope="col"
                className="whitespace-nowrap py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-3"
              >
                名稱
              </th>
              {dateRange.map((date) => (
                <th
                  scope="col"
                  className="whitespace-nowrap px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  {date}
                </th>
              ))}

              <th
                scope="col"
                className="whitespace-nowrap relative py-3.5 pl-3 pr-4 sm:pr-3 font-semibold text-gray-900"
              >
                合計
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="divide-x divide-gray-200">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">多易</td>
              {t1.map((val) => (
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{val.toLocaleString()}</td>
              ))}
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3 font-semibold text-gray-900">
                {t1
                  .reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                  }, 0)
                  .toLocaleString()}
              </td>
            </tr>
            <tr className="bg-red-100 divide-x divide-gray-200">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">艾思</td>
              {t2.map((val) => (
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{val.toLocaleString()}</td>
              ))}
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3 font-semibold text-gray-900">
                {t2
                  .reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                  }, 0)
                  .toLocaleString()}
              </td>
            </tr>
            <tr className="bg-purple-100 divide-x divide-gray-200">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-3">華而敦</td>
              {t3.map((val) => (
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">{val.toLocaleString()}</td>
              ))}
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3 font-semibold text-gray-900">
                {t3
                  .reduce((accumulator, currentValue) => {
                    return accumulator + currentValue;
                  }, 0)
                  .toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
