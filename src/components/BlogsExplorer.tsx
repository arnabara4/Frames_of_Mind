"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Blog } from "@/lib/types";
import { BlogCard } from "@/components/BlogCard";
import { useAuth } from "@/components/AuthProvider";
import { StaggerGrid, StaggerItem } from "@/components/motion";

const PER_PAGE = 8;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BlogsExplorer({ blogs }: { blogs: Blog[] }) {
  const { owner } = useAuth();
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<"all" | number>("all");
  const [month, setMonth] = useState<"all" | number>("all");
  const [page, setPage] = useState(1);
  const [goto, setGoto] = useState("");

  // Distinct years present in the blogs, newest first.
  const years = useMemo(() => {
    const set = new Set<number>();
    blogs.forEach((b) => set.add(new Date(b.created_at).getFullYear()));
    return [...set].sort((a, b) => b - a);
  }, [blogs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = blogs.filter((b) => {
      const d = new Date(b.created_at);
      if (year !== "all" && d.getFullYear() !== year) return false;
      if (month !== "all" && d.getMonth() !== month) return false;
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !(b.excerpt ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    // Always newest first.
    list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return list;
  }, [blogs, query, year, month]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [query, year, month]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const start = (page - 1) * PER_PAGE;
  const pageItems = filtered.slice(start, start + PER_PAGE);

  const hasFilter = year !== "all" || month !== "all" || query.trim();

  function jump() {
    const n = parseInt(goto, 10);
    if (!Number.isNaN(n)) setPage(Math.min(pageCount, Math.max(1, n)));
    setGoto("");
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-sm italic text-maple/70">
            a collection of autumn thoughts
          </p>
          <h1 className="font-display text-4xl font-extrabold text-coral md:text-6xl">
            My Blogs
          </h1>
        </div>

        {owner && (
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-xl px-5 py-2.5 font-medium text-ink/60 transition hover:text-coral"
            >
              Dashboard
            </Link>
            <Link
              href="/blogs/new"
              className="rounded-xl border-2 border-coral px-7 py-2.5 font-medium text-coral transition hover:bg-coral hover:text-white active:scale-95"
            >
              + Add Blog
            </Link>
          </div>
        )}
      </div>

      {/* ── Filter shelf — part of the page, autumn-styled ── */}
      <div className="mt-8 rounded-[28px] border border-maple/15 bg-gradient-to-br from-peach/40 via-cream/60 to-salmon/25 p-4 shadow-[var(--shadow-warm)] backdrop-blur md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:max-w-xs">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-maple/60">
              ⌕
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the words…"
              className="w-full rounded-full border border-maple/20 bg-white/80 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-coral"
            />
          </div>

          {/* Month + Year pickers */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-maple/60">
              🍂 Filter by date
            </span>
            <Select
              label="Month"
              value={month === "all" ? "all" : String(month)}
              onChange={(v) => setMonth(v === "all" ? "all" : Number(v))}
              options={[
                { value: "all", label: "All months" },
                ...MONTHS.map((m, i) => ({ value: String(i), label: m })),
              ]}
            />
            <Select
              label="Year"
              value={year === "all" ? "all" : String(year)}
              onChange={(v) => setYear(v === "all" ? "all" : Number(v))}
              options={[
                { value: "all", label: "All years" },
                ...years.map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
            {hasFilter && (
              <button
                onClick={() => {
                  setQuery("");
                  setMonth("all");
                  setYear("all");
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-coral underline-offset-2 transition hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Result line */}
        <p className="mt-3 px-1 text-xs text-bark/55">
          {filtered.length} {filtered.length === 1 ? "story" : "stories"}
          {month !== "all" && ` · ${MONTHS[month]}`}
          {year !== "all" && ` ${year}`}
          {query && ` · matching “${query}”`} · page {page} of {pageCount}
        </p>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-bark/50">
          No stories from this time — try another month or year. 🍁
        </p>
      ) : (
        <StaggerGrid
          key={`${query}-${month}-${year}-${page}`}
          className="mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-2"
        >
          {pageItems.map((b, i) => (
            <StaggerItem key={b.id} className="h-full">
              <BlogCard blog={b} seed={i} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}

      {/* ── Pagination ── */}
      {pageCount > 1 && (
        <div className="mt-12 flex flex-col items-center gap-5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <PageBtn
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </PageBtn>

            {pageNumbers(page, pageCount).map((n, i) =>
              n === "…" ? (
                <span key={`g${i}`} className="px-2 text-bark/40">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n as number)}
                  className={`h-10 w-10 rounded-full text-sm font-semibold transition active:scale-90 ${
                    page === n
                      ? "bg-coral text-white shadow-[var(--shadow-warm)]"
                      : "bg-white/70 text-bark/70 ring-1 ring-maple/15 hover:bg-peach/50 hover:text-coral"
                  }`}
                >
                  {n}
                </button>
              ),
            )}

            <PageBtn
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              Next →
            </PageBtn>
          </div>

          {/* Go-to jump */}
          <div className="flex items-center gap-2 text-sm text-bark/60">
            <span>Leap to</span>
            <input
              type="number"
              min={1}
              max={pageCount}
              value={goto}
              onChange={(e) => setGoto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && jump()}
              placeholder="#"
              className="h-9 w-16 rounded-full border border-maple/25 bg-white/80 text-center outline-none transition focus:border-coral"
            />
            <button
              onClick={jump}
              className="h-9 rounded-full bg-coral px-4 text-sm font-semibold text-white transition hover:bg-coral-dark active:scale-95"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-full border border-maple/20 bg-white/80 py-2 pl-4 pr-9 text-sm font-medium text-bark/80 outline-none transition hover:border-coral focus:border-coral"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-maple/60">
        ▾
      </span>
    </label>
  );
}

function PageBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-bark/70 ring-1 ring-maple/15 transition hover:bg-peach/50 hover:text-coral active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 12 */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  if (lo > 2) out.push("…");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < total - 1) out.push("…");
  out.push(total);
  return out;
}
