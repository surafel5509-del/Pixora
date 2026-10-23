import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { SettingsProvider } from "@/context/SettingsProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { LibraryProvider } from "@/context/LibraryProvider";
import { UIProvider } from "@/context/UIProvider";
import { HomePage } from "@/pages/HomePage";
import { ExplorePage } from "@/pages/ExplorePage";
import { SearchPage } from "@/pages/SearchPage";
import { MediaPage } from "@/pages/MediaPage";
import { SavedPage } from "@/pages/SavedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Secondary routes are code-split: the discovery experience loads fast and the
// rest streams in on demand.
const BoardsPage = lazy(() => import("@/pages/BoardsPage").then((m) => ({ default: m.BoardsPage })));
const BoardPage = lazy(() => import("@/pages/BoardPage").then((m) => ({ default: m.BoardPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const ContributePage = lazy(() =>
  import("@/pages/ContributePage").then((m) => ({ default: m.ContributePage })),
);
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const HelpPage = lazy(() => import("@/pages/HelpPage").then((m) => ({ default: m.HelpPage })));
const AuthPage = lazy(() => import("@/pages/AuthPage").then((m) => ({ default: m.AuthPage })));
const LegalPage = lazy(() => import("@/pages/LegalPage").then((m) => ({ default: m.LegalPage })));

function RouteFallback() {
  return (
    <div className="py-6">
      <SkeletonGrid count={6} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <LibraryProvider>
              <UIProvider>
                <BrowserRouter>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route element={<AppShell />}>
                        <Route index element={<HomePage />} />
                        <Route path="explore" element={<ExplorePage />} />
                        <Route path="search" element={<SearchPage />} />
                        <Route path="media/:type/:id" element={<MediaPage />} />
                        <Route path="saved" element={<SavedPage />} />
                        <Route path="boards" element={<BoardsPage />} />
                        <Route path="boards/:boardId" element={<BoardPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="contribute" element={<ContributePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="about" element={<AboutPage />} />
                        <Route path="help" element={<HelpPage />} />
                        <Route path="auth" element={<AuthPage />} />
                        <Route path="privacy" element={<LegalPage kind="privacy" />} />
                        <Route path="terms" element={<LegalPage kind="terms" />} />
                        <Route path="*" element={<NotFoundPage />} />
                      </Route>
                    </Routes>
                  </Suspense>
                </BrowserRouter>
              </UIProvider>
            </LibraryProvider>
          </AuthProvider>
        </ToastProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
