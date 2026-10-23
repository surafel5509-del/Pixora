import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SettingsProvider } from "@/context/SettingsProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { LibraryProvider } from "@/context/LibraryProvider";
import { UIProvider } from "@/context/UIProvider";

/** Renders a component inside the full provider stack used by the real app. */
export function renderWithProviders(
  ui: ReactElement,
  { route = "/", ...options }: { route?: string } & Omit<RenderOptions, "wrapper"> = {},
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <LibraryProvider>
              <UIProvider>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
              </UIProvider>
            </LibraryProvider>
          </AuthProvider>
        </ToastProvider>
      </SettingsProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
