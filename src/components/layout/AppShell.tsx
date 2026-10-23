import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { MobileDrawer, MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthModal } from "@/components/auth/AuthModal";
import { CommandPalette } from "@/components/search/CommandPalette";
import { SaveToBoardDialog } from "@/components/media/SaveToBoardDialog";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { useUI } from "@/context/UIProvider";

export function AppShell() {
  const location = useLocation();
  const { setNavOpen } = useUI();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search, setNavOpen]);

  return (
    <div className="flex min-h-dvh bg-canvas text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-ink"
      >
        Skip to content
      </a>

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main"
          className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12"
        >
          <Outlet />
        </main>
        <Footer />
      </div>

      <MobileNav />
      <MobileDrawer />
      <CommandPalette />
      <AuthModal />
      <SaveToBoardDialog />
      <ScrollToTop />
    </div>
  );
}
