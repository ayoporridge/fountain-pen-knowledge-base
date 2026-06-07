interface EntityMetaProps {
  attrs: Array<{ key: string; value: string }>;
  labels: Record<string, string>;
}

export function EntityMeta({ attrs, labels }: EntityMetaProps) {
  if (attrs.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
        属性
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {attrs.map((attr) => (
          <div key={attr.key} className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {labels[attr.key] || attr.key}
            </span>
            <span className="text-sm text-gray-900 dark:text-gray-100">
              {attr.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
