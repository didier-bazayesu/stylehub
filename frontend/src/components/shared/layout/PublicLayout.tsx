import { Navbar } from "@/components/shared/layout/Navbar";
import { Footer } from "@/components/shared/layout/Footer";
import { SearchModal } from "@/components/shared/layout/SearchModal";
import { CartDrawer } from "@/components/shared/layout/CartDrawer";
import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <SearchModal />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
