"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] render error", error);
  }, [error]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#ECE6E0] px-5 text-[#1F2433]">
      <div className="w-full max-w-md rounded-2xl border border-[#1F2433]/12 bg-[#F6F0E8]/70 p-8 text-center">
        <h1 className="font-serif text-3xl">Something went wrong</h1>
        <p className="mt-3 text-sm leading-6 text-[#1F2433]/65">
          We couldn&apos;t load your workspace. This is usually temporary.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[#1F2433] px-6 py-3 text-sm font-medium text-[#ECE6E0] transition hover:bg-[#0F1322]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
