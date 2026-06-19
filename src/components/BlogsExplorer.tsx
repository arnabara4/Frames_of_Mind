"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Blog } from "@/lib/types";
import { BlogCard } from "@/components/BlogCard";
import { useAuth } from "@/components/AuthProvider";
import { StaggerGrid, StaggerItem } from "@/components/motion";
import FancyDropdown from "@/components/FancyDropdown";

const PER_PAGE = 8;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Seasonal motif per month — drives the emoji + soft background tint of each row. */
function season(m: number): { emoji: string; grad: string; name: string } {
  if (m === 11 || m === 0 || m === 1)
    return { emoji: "❄️", grad: "from-sky-100 to-white", name: "Winter" };
  if (m >= 2 && m <= 4)
    return { emoji: "🌸", grad: "from-rose-100 to-emerald-50", name: "Spring" };
  if (m >= 5 && m <= 7)
    return { emoji: "☀️", grad: "from-amber-100 to-yellow-50", name: "Summer" };
  return { emoji: "🍂", grad: "from-coral/20 to-amber/25", name: "Autumn" };
}

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

  // Counts power the badges in the dropdowns.
  const yearCounts = useMemo(() => {
    const m = new Map<number, number>();
    blogs.forEach((b) => {
      const y = new Date(b.created_at).getFullYear();
      m.set(y, (m.get(y) ?? 0) + 1);
    });
    return m;
  }, [blogs]);

  // Month counts respect the chosen year so the two pickers feel connected.
  const monthCounts = useMemo(() => {
    const arr = new Array(12).fill(0);
    blogs.forEach((b) => {
      const d = new Date(b.created_at);
      if (year === "all" || d.getFullYear() === year) arr[d.getMonth()]++;
    });
    return arr;
  }, [blogs, year]);

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
          <div className="relative w-full lg:max-w-[18rem]">
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

          {/* Center ornament — fills the middle, reflects the selection */}
          <div className="hidden flex-1 flex-col items-center justify-center px-4 text-center lg:flex">
            <p className="font-display text-lg font-semibold text-coral">
              {month === "all" && year === "all"
                ? "Wander through the seasons"
                : `${month === "all" ? "" : MONTHS[month] + " "}${year === "all" ? "" : year}`.trim()}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 font-serif text-xs italic text-maple/70">
              <span>🍂</span>
              {month === "all" && year === "all"
                ? "every story, every autumn"
                : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"} found`}
              <span>🍁</span>
            </p>
          </div>

          {/* Month + Year pickers */}
          <div className="flex flex-wrap items-center gap-2">
            <FancyDropdown
              label="Month"
              icon={<span>{month === "all" ? "🗓️" : season(month).emoji}</span>}
              summary={month === "all" ? "All" : MONTHS[month]}
              panelClass="w-60"
            >
              {(close) => (
                <div className="flex flex-col gap-1">
                  <Row
                    active={month === "all"}
                    onClick={() => {
                      setMonth("all");
                      close();
                    }}
                    left={<span>🗓️</span>}
                    label="All months"
                  />
                  {MONTHS.map((m, i) => {
                    const s = season(i);
                    return (
                      <Row
                        key={m}
                        active={month === i}
                        disabled={monthCounts[i] === 0}
                        onClick={() => {
                          setMonth(i);
                          close();
                        }}
                        grad={s.grad}
                        left={<span>{s.emoji}</span>}
                        label={m}
                        hint={s.name}
                        count={monthCounts[i]}
                      />
                    );
                  })}
                </div>
              )}
            </FancyDropdown>

            <FancyDropdown
              label="Year"
              icon={<span>🍁</span>}
              summary={year === "all" ? "All" : String(year)}
              panelClass="w-56"
            >
              {(close) => (
                <div className="flex flex-col gap-1">
                  <Row
                    active={year === "all"}
                    onClick={() => {
                      setYear("all");
                      close();
                    }}
                    left={<span>🍁</span>}
                    label="All years"
                  />
                  {years.map((y) => (
                    <Row
                      key={y}
                      active={year === y}
                      onClick={() => {
                        setYear(y);
                        close();
                      }}
                      left={<YearRing year={y} />}
                      label={String(y)}
                      hint="a year of leaves"
                      count={yearCounts.get(y) ?? 0}
                    />
                  ))}
                </div>
              )}
            </FancyDropdown>

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

/** One selectable row inside a fancy dropdown, with seasonal tint + count badge. */
function Row({
  active,
  disabled,
  onClick,
  left,
  label,
  hint,
  count,
  grad,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  left: React.ReactNode;
  label: string;
  hint?: string;
  count?: number;
  grad?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
        active
          ? "bg-coral text-white shadow-sm"
          : disabled
            ? "cursor-not-allowed opacity-40"
            : grad
              ? `bg-gradient-to-r ${grad} hover:brightness-105`
              : "hover:bg-peach/50"
      }`}
    >
      <span className="grid h-7 w-7 place-items-center text-base">{left}</span>
      <span className="flex flex-1 flex-col leading-tight">
        <span
          className={`text-sm font-semibold ${active ? "text-white" : "text-bark"}`}
        >
          {label}
        </span>
        {hint && (
          <span
            className={`text-[10px] ${active ? "text-white/80" : "text-bark/50"}`}
          >
            {hint}
          </span>
        )}
      </span>
      {typeof count === "number" && (
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
            active
              ? "bg-white/25 text-white"
              : "bg-white/70 text-maple ring-1 ring-maple/15"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/** A little tree-ring badge for each year — autumn-unique flourish. */
function YearRing({ year }: { year: number }) {
  const rings = (year % 3) + 2; // 2–4 concentric rings, varies by year
  return (
    <span className="relative grid h-6 w-6 place-items-center">
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full border border-maple/50"
          style={{
            width: `${100 - i * 26}%`,
            height: `${100 - i * 26}%`,
          }}
        />
      ))}
      <span className="h-1 w-1 rounded-full bg-coral" />
    </span>
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
