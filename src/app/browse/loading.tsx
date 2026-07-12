export default function BrowseLoading() {
  const typeSkeletons = ["all", "pen", "brand", "article", "knowledge"];
  const cardSkeletons = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-8"
      role="status"
      aria-label="正在载入馆藏"
    >
      <div className="mb-6 h-10 w-48 animate-pulse rounded bg-[var(--color-surface-dim)]" />
      <div className="mb-6 grid gap-2 sm:grid-cols-5">
        {typeSkeletons.map((key) => (
          <div
            key={key}
            className="h-20 animate-pulse rounded-xl bg-[var(--color-surface-dim)]"
          />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:ml-72 lg:grid-cols-3">
        {cardSkeletons.map((key) => (
          <div
            key={key}
            className="overflow-hidden rounded-xl border"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="h-32 animate-pulse bg-[var(--color-accent-light)]" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-[var(--color-surface-dim)]" />
              <div className="h-3 w-full animate-pulse rounded bg-[var(--color-surface-dim)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
