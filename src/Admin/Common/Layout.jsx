import React from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen w-screen bg-white relative overflow-hidden">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#23234A] scrollbar-track-transparent 
        ml-[200px] sm:ml-[220px] lg:ml-[240px] p-4">
        <Outlet /> {/* ✅ Nested route components render here */}
      </main>
    </div>
  );
};

export default Layout;
