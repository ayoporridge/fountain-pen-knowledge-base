import { LinkSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { TYPE_LABELS } from "@/lib/constants";
import { entityIdentityKey } from "@/lib/entity-identity";

interface LinkItem {
  link_type: string;
  target_name: string;
  target_type: string;
  target_slug: string;
}

interface RelatedEntitiesProps {
  links: LinkItem[];
}

export function RelatedEntities({ links }: RelatedEntitiesProps) {
  if (links.length === 0) return null;

  const dedupeLinks = (items: LinkItem[]) =>
    Array.from(
      new Map(
        items.map((item) => [
          entityIdentityKey({
            type: item.target_type,
            slug: item.target_slug,
            name: item.target_name,
          }),
          item,
        ]),
      ).values(),
    );

  const related = dedupeLinks(links);

  const LinkList = ({ items }: { items: LinkItem[] }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h3
          className="text-sm font-medium flex items-center gap-1.5 mb-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          <LinkSimple size={14} />
          相关条目 ({items.length})
        </h3>
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={`${item.target_type}:${item.target_slug}`}>
              <Link
                href={`/${item.target_type}/${item.target_slug}`}
                className="flex items-center gap-2 p-2 rounded-lg text-sm transition-colors hover:bg-[var(--color-surface-raised)] ink-underline"
                style={{ color: "var(--color-ink)" }}
              >
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {TYPE_LABELS[item.target_type] || item.target_type}
                </span>
                <span className="truncate">{item.target_name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div
      className="p-4 rounded-xl border"
      style={{
        borderColor: "var(--color-border)",
        backgroundColor: "var(--color-surface-raised)",
      }}
    >
      <LinkList items={related} />
    </div>
  );
}
