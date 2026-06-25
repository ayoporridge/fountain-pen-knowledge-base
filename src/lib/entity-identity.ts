export interface EntityIdentityInput {
  type: string;
  slug?: string | null;
  name?: string | null;
}

function compactAscii(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function compactFallback(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

export function entityIdentityKey(entity: EntityIdentityInput) {
  const slug = entity.slug || "";
  const name = entity.name || "";
  const ascii = compactAscii(slug) || compactAscii(name);
  const fallback = compactFallback(slug) || compactFallback(name);

  return `${entity.type}:${ascii || fallback}`;
}

export function dedupeByEntityIdentity<T extends EntityIdentityInput>(
  entities: T[],
) {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const entity of entities) {
    const key = entityIdentityKey(entity);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entity);
  }

  return deduped;
}
