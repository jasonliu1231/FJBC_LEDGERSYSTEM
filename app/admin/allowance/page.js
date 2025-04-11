"use client";

import { useEffect, useState } from "react";
import Review from "./review";
import DepartmentSearch from "./departmentsearch";
import DetailSearch from "./detailsearch";

const items = ["審核", "單位查詢", "明細查詢"];

export default function Home() {
  const [state, setState] = useState(0);
  return (
    <div className="container mx-auto">
      <div className="flex space-x-8">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              setState(index);
            }}
            className={`${
              state == index ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            } whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium cursor-pointer w-full text-center text-xl`}
          >
            {item}
          </div>
        ))}
      </div>
      {state == 0 ? <Review /> : state == 1 ? <DepartmentSearch /> : state == 2 ? <DetailSearch /> : null}
    </div>
  );
}
