import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "../ui/Toast";

export const Layout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar />
      <main className="flex-1 ml-60 min-h-screen overflow-auto">
        <div className="fade-in">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};
