import { CustomerSidebar } from "@/components/shared/layout/CustomerSidebar";
import { Outlet } from "react-router-dom";

export function CustomerLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <CustomerSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
