export default function SearchLoading() {
  const skeletons = ["a", "b", "c", "d", "e", "f"];
  return (
    <div
      className="mx-auto max-w-4xl px-4 py-8"
      role="status"
      aria-label="正在载入搜索"
    >
      <div className="mb-6 h-5 w-16 animate-pulse rounded bg-[var(--color-surface-dim)]" />
      <div className="mb-6 h-10 w-32 animate-pulse rounded bg-[var(--color-surface-dim)]" />
      <div
        className="mb-8 h-14 animate-pulse rounded-xl border bg-[var(--color-surface-raised)]"
        style={{ borderColor: "var(--color-border)" }}
      />
      <div className="space-y-2">
        {skeletons.map((key) => (
          <div
            key={key}
            className="h-28 animate-pulse rounded-xl border bg-[var(--color-surface-raised)]"
            style={{ borderColor: "var(--color-border)" }}
          />
        ))}
      </div>
    </div>
  );
}
