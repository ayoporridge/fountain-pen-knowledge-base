import Link from "next/link";
import type { BrandPageData } from "@/lib/entity-page";

type BrandMuseumProps = Pick<BrandPageData, "timeline" | "models">;

export function BrandMuseum({ timeline, models }: BrandMuseumProps) {
  return (
    <div className="encyclopedia-brand-facts space-y-8">
      <section id="timeline" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-ink">品牌时间线</h2>
        <ol className="space-y-3">
          {timeline.map((event) => (
            <li
              key={`${event.startDate}:${event.title}`}
              className="library-panel p-4"
            >
              <p className="font-semibold text-ink">
                {event.circa ? "约 " : ""}
                {event.startDate}
                {event.endDate ? `—${event.endDate}` : ""} · {event.title}
              </p>
              {event.description ? (
                <p className="mt-2 text-sm leading-6 text-ink-light">
                  {event.description}
                </p>
              ) : null}
              <a
                href={event.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-11 items-center text-sm ink-underline"
              >
                来源：{event.source.title}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section id="models" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-ink">
          全部型号（{models.length}）
        </h2>
        <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
          {models.map((model) => (
            <li key={`${model.type}:${model.slug}`}>
              <Link
                href={`/${model.type}/${model.slug}`}
                className="flex min-h-11 items-center rounded-lg border px-3 py-2 text-ink"
                style={{ borderColor: "var(--color-border-light)" }}
              >
                {model.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
