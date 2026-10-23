import { Compass, Home } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { ButtonLink } from "@/components/ui/Button";

export function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page not found"
        description="The page you're looking for doesn't exist."
        path="/404"
        noIndex
      />

      <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
        <p className="font-display text-[6rem] font-extrabold leading-none text-brand">404</p>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-ink sm:text-3xl">
          This page wandered off
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          The link may be broken, or the piece you were looking for has moved on. The discovery feed is a good
          place to start again.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/" variant="primary" size="lg" iconLeft={<Home size={16} />}>
            Back home
          </ButtonLink>
          <ButtonLink to="/explore" variant="outline" size="lg" iconLeft={<Compass size={16} />}>
            Explore inspiration
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
