export default function DashboardLoading() {
  return (
    <main className="min-h-[100dvh] bg-[#ECE6E0] px-5 py-6 md:px-10 md:py-7">
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-6">
        <div className="h-10 w-48 rounded-lg bg-[#1F2433]/10" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 rounded-2xl bg-[#1F2433]/10" />
          <div className="h-32 rounded-2xl bg-[#1F2433]/10" />
          <div className="h-32 rounded-2xl bg-[#1F2433]/10" />
        </div>
        <div className="h-64 rounded-2xl bg-[#1F2433]/10" />
      </div>
      <span className="sr-only">Loading your workspace…</span>
    </main>
  );
}
