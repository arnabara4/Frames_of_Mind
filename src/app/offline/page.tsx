"use client";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-peach to-salmon text-5xl shadow-[var(--shadow-warm)]">
        🍂
      </div>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-coral">
        You&apos;re offline
      </h1>
      <p className="mt-3 font-serif text-lg italic leading-relaxed text-bark/75">
        The autumn wind carried the connection away. Some pages you&apos;ve
        already visited will still open — reconnect to read the rest.
      </p>
      <button
        onClick={() => location.reload()}
        className="mt-8 rounded-full bg-coral px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-warm)] transition hover:bg-coral-dark active:scale-95"
      >
        Try again
      </button>
      <a
        href="/"
        className="mt-4 text-sm font-medium text-bark/50 transition hover:text-coral"
      >
        Back to home
      </a>
    </div>
  );
}
