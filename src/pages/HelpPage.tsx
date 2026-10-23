import { useMemo, useState } from "react";
import { ChevronDown, Command, Keyboard, LifeBuoy, Mail, Search, Sparkles } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { FAQS } from "@/data/content";
import { cn, unique } from "@/lib/utils";

const SHORTCUTS = [
  { keys: "⌘ / Ctrl + K", action: "Open the command palette" },
  { keys: "/", action: "Jump to search" },
  { keys: "↑ ↓", action: "Move through suggestions or commands" },
  { keys: "↵", action: "Run the highlighted command" },
  { keys: "Esc", action: "Close dialogs and the palette" },
];

export function HelpPage() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = useMemo(() => unique(FAQS.map((faq) => faq.category)), []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return FAQS;
    return FAQS.filter((faq) => `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(term));
  }, [query]);

  return (
    <>
      <Seo
        title="Help centre"
        description="Answers, guides and shortcuts for using Pixora — search, boards, accounts and privacy."
        path="/help"
      />

      <header className="mb-10 max-w-2xl">
        <p className="eyebrow">Support</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          How can we help?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Everything you need to get the most out of Pixora. If something is missing, the source and issue
          tracker are public — feedback is always welcome.
        </p>
        <div className="mt-6">
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the help centre…"
            aria-label="Search help articles"
          />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {categories.map((category) => {
            const entries = filtered.filter((faq) => faq.category === category);
            if (!entries.length) return null;

            return (
              <section key={category} className="mb-8">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{category}</h2>
                <div className="surface-card overflow-hidden">
                  {entries.map((faq) => {
                    const index = FAQS.indexOf(faq);
                    const open = openIndex === index;
                    return (
                      <div key={faq.question} className="border-b border-line last:border-b-0">
                        <button
                          type="button"
                          onClick={() => setOpenIndex(open ? null : index)}
                          aria-expanded={open}
                          className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-surface-2/50"
                        >
                          <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={16}
                            className={cn("shrink-0 text-muted transition-transform", open && "rotate-180")}
                            aria-hidden
                          />
                        </button>
                        {open ? (
                          <p className="animate-fade-in px-5 pb-5 text-sm leading-relaxed text-muted">
                            {faq.answer}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
              No help articles match “{query}”. Try a shorter phrase.
            </p>
          ) : null}

          <section id="guidelines" className="mb-8 scroll-mt-24">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
              Creator guidelines
            </h2>
            <div className="surface-card p-6 text-sm leading-relaxed text-muted">
              <p>
                Media in Pixora comes from open catalogues and user submissions. Before sharing anything to a
                public board, confirm you hold the rights or the licence permits reuse, keep attribution
                intact, and avoid uploading identifiable people without consent.
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {[
                  "Submit only content you created or that is explicitly licensed for reuse.",
                  "Credit the original creator in the source field whenever possible.",
                  "Avoid trademarks, private property and personal data in public boards.",
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Sparkles size={14} className="mt-1 shrink-0 text-brand" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="licensing" className="scroll-mt-24">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Licensing</h2>
            <div className="surface-card p-6 text-sm leading-relaxed text-muted">
              <p>
                Pixora links to media hosted by third parties and never claims ownership of it. Each item
                carries its source and attribution, and downloading is subject to the licence of the original
                provider. The Pixora sample library is provided for demonstration purposes only.
              </p>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="surface-card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <Keyboard size={16} aria-hidden /> Keyboard shortcuts
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              {SHORTCUTS.map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-muted">{shortcut.action}</dt>
                  <dd>
                    <kbd className="rounded-md border border-line bg-surface-2 px-2 py-1 text-[0.6875rem] font-semibold text-ink">
                      {shortcut.keys}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 inline-flex items-center gap-2 text-[0.6875rem] text-muted">
              <Command size={12} aria-hidden /> The command palette doubles as search.
            </p>
          </div>

          <div className="surface-card p-6">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink">
              <LifeBuoy size={16} aria-hidden /> Still stuck?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Open an issue on the public repository and include what you expected, what happened and the page
              you were on. Bug reports with repro steps get fixed first.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <ButtonLink to="/contribute" variant="outline" size="sm">
                Add your own media
              </ButtonLink>
              <a
                href="https://github.com/surafel5509-del/Pixora/issues"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-8 items-center justify-center gap-2 rounded-xl border border-line px-3 text-[0.8125rem] font-semibold text-ink transition hover:bg-surface-2"
              >
                <Mail size={13} aria-hidden /> Open an issue
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface-2/60 p-6">
            <Badge tone="brand">Tip</Badge>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Search works best with concrete nouns and moods — “brutalist stairwell” beats “architecture”.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted">
              <Search size={12} aria-hidden /> Try it from the home page.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
