export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-line" />
      <div className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-line" />
      <div className="h-72 animate-pulse rounded-2xl bg-white ring-1 ring-line" />
    </div>
  );
}
