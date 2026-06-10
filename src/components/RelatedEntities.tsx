import Link from "next/link";
import { ArrowRight, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { TYPE_LABELS } from "@/lib/constants";

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

  const forward = links.filter(
    (l) => l.link_type === "related_to" || l.link_type === "instance_of"
  );
  const backlinks = links.filter(
    (l) => l.link_type !== "related_to" && l.link_type !== "instance_of"
  );

  const LinkList = ({
    items,
    label,
    icon,
  }: {
    items: LinkItem[];
    label: string;
    icon: React.ReactNode;
  }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h3
          className="text-sm font-medium flex items-center gap-1.5 mb-2"
          style={{ color: "var(--color-ink-muted)" }}
        >
          {icon}
          {label} ({items.length})
        </h3>
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={`${item.target_slug}-${i}`}>
              <Link
                href={`/${item.target_type}/${item.target_slug}`}
                className="flex items-center gap-2 p-2 rounded-lg text-sm transition-colors hover:bg-[var(--color-surface-raised)]"
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
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        关联词条
      </h3>
      <div className="space-y-4">
        <LinkList
          items={forward}
          label="链接到"
          icon={<ArrowRight size={14} />}
        />
        <LinkList
          items={backlinks}
          label="被引用"
          icon={<ArrowLeft size={14} />}
        />
      </div>
    </div>
  );
}
