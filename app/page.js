"use client";

import { useState } from "react";

export default function Example() {
  const [loginLoading, setLoginLoading] = useState(false);
  const [info, setInfo] = useState({
    username: "",
    password: ""
  });

  async function login() {
    if (info.username == "" || info.password == "") {
      alert("帳號密碼不可以為空！");
      return;
    }
    const client_id = Math.floor(Math.random() * 10000000);

    setLoginLoading(true);
    const config = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        username: info.username,
        password: info.password,
        client_id: client_id
      })
    };
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_8100}/fjbc_login_api/auth/login`, config);
    const res = await response.json();
    if (response.ok) {
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("client_id", client_id);
      localStorage.setItem("user_id", res.user.id);
      window.location.href = "/admin/bill";
    } else {
      if (response.status == 403) {
        alert(res.detail["zh-TW"]);
      } else {
        alert("系統錯誤！");
      }
    }
    setLoginLoading(false);
  }
  return (
    <>
      <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm space-y-10">
          <div>
            <img
              src="/FJBC_Logo.png"
              className="mx-auto h-20 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">財務系統</h2>
          </div>
          <div className="space-y-6">
            <div className="relative -space-y-px rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-gray-300" />
              <div>
                <label
                  htmlFor="email-address"
                  className="sr-only"
                >
                  帳號
                </label>
                <input
                  value={info?.username || ""}
                  onChange={(event) => {
                    setInfo({
                      ...info,
                      username: event.target.value
                    });
                  }}
                  type="text"
                  placeholder="帳號"
                  className="p-4 relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="sr-only">密碼</label>
                <input
                  value={info?.password || ""}
                  onChange={(event) => {
                    setInfo({
                      ...info,
                      password: event.target.value
                    });
                  }}
                  type="password"
                  placeholder="密碼"
                  className="p-4 relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              {loginLoading ? (
                <div className="flex justify-center items-center">
                  <div className="spinner"></div>
                  <div>
                    <div className="mx-4 text-blue-500">登入中，請稍候...</div>
                    <div className="mx-4 text-blue-500">Logging in, please wait...</div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  登入
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
