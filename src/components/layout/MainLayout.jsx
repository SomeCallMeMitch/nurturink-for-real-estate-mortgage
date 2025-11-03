import React from "react";
import LeftSidebar from "./LeftSidebar";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <LeftSidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}