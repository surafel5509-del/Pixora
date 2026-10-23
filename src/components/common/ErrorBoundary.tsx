import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface State {
  error: Error | null;
}

/** Catches render-time crashes so a single bad card never blanks the product. */
export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[Pixora] Unhandled UI error", error, info.componentStack);
  }

  override render() {
    if (!this.state.error) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8 text-center shadow-card">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-danger/10 text-danger">
            <TriangleAlert size={22} aria-hidden />
          </span>
          <h1 className="text-lg font-bold text-ink">Something broke on our side</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {this.state.error.message || "An unexpected error interrupted this page."}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="primary"
              iconLeft={<RotateCw size={15} />}
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </Button>
            <Button variant="outline" onClick={() => window.location.assign("/")}>
              Back home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
