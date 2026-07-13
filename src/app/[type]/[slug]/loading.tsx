export const ENTITY_DETAIL_LOADING_CONTAINER_CLASS =
  "max-w-4xl mx-auto py-8 px-4 animate-pulse";
export const ENTITY_DETAIL_LOADING_SUMMARY_CLASS =
  "h-4 w-full max-w-96 bg-surface-dim rounded mb-8";

export default function Loading() {
  return (
    <div
      className={ENTITY_DETAIL_LOADING_CONTAINER_CLASS}
      data-testid="entity-detail-loading"
    >
      <div className="h-4 w-16 bg-surface-dim rounded mb-6" />
      <div className="h-8 w-64 bg-surface-dim rounded mb-4" />
      <div className={ENTITY_DETAIL_LOADING_SUMMARY_CLASS} />
      <div className="h-48 bg-surface-dim rounded" />
    </div>
  );
}
