import { VendorSidebar } from "@/components/shared/layout/VendorSidebar";
import { Outlet } from "react-router-dom";

export function VendorLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <VendorSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
