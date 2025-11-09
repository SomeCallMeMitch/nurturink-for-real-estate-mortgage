import React from "react";
import LeftSidebar from "./LeftSidebar";

export default function MainLayout({ children, whitelabelSettings }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <LeftSidebar whitelabelSettings={whitelabelSettings} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}