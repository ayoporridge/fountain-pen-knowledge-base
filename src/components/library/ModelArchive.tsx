import type { ModelPageData } from "@/lib/entity-page";

type ModelArchiveProps = Pick<ModelPageData, "specs" | "variants">;

export function ModelArchive({ specs, variants }: ModelArchiveProps) {
  return (
    <div className="encyclopedia-model-facts space-y-8">
      <section id="specs" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-ink">核心规格</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {specs.map((spec) => (
            <div key={spec.key} className="library-panel p-4">
              <dt className="text-sm text-ink-muted">{spec.label}</dt>
              <dd className="mt-1 font-semibold text-ink">
                {String(spec.value)}
              </dd>
              <dd className="mt-2 text-sm text-ink-muted">
                <a
                  href={spec.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center ink-underline"
                >
                  来源：{spec.source.title}
                </a>
                {spec.source.locator ? ` · ${spec.source.locator}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {variants.length > 0 ? (
        <section id="variants" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-semibold text-ink">版本差异</h2>
          <ul className="space-y-3">
            {variants.map((variant) => (
              <li
                key={`${variant.name}:${variant.releaseYear || ""}`}
                className="library-panel p-4"
              >
                <p className="font-semibold text-ink">{variant.name}</p>
                {variant.releaseYear ? (
                  <p className="mt-1 text-sm text-ink-muted">
                    发布年份：{variant.releaseYear}
                  </p>
                ) : null}
                {variant.notes ? (
                  <p className="mt-2 text-sm leading-6 text-ink-light">
                    {variant.notes}
                  </p>
                ) : null}
                <a
                  href={variant.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-sm ink-underline"
                >
                  来源：{variant.source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
