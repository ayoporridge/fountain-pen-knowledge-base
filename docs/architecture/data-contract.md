# Data Contract

Date: 2026-06-24

This document fixes the v1 data assumptions used by pages, APIs, scripts, and future agent goals.

## Entity Types

The v1 entity type set is:

| Type | Label | Route Example | Purpose |
|---|---|---|---|
| `pen` | 钢笔 | `/pen/sheaffer-s-snorkel` | Individual pen models or model families. |
| `brand` | 品牌 | `/brand/sheaffer` | Makers and brands. |
| `concept` | 概念 | `/concept/piston-filler` | Concepts, mechanisms, usage ideas, and generated concept rules. |
| `material` | 材质 | `/material/celluloid` | Body/nib/feed materials. |
| `nib` | 笔尖 | `/nib/...` | Nib-related articles and concepts. |
| `fill_system` | 上墨方式 | `/fill_system/...` | Filling mechanisms. |
| `article` | 文章 | `/article/the-baguio-surrender-pens` | Long-form translated or imported source articles. |

Source of truth:

- Runtime labels/colors/icons: `src/lib/constants.ts`
- Fresh schema CHECK constraint: `migrations/002_schema.sql`
- Current local database already includes `article` in the `entities.type` CHECK constraint.

## Tag Dimensions

The browse API currently exposes these facet dimensions:

`nib_type`, `nib_material`, `fill_system`, `origin`, `price`, `brand_tier`, `era`, `size`, `usage`, `style`, `ink_type`, `body_material`.

Friendly dimension routes currently use:

| Route Slug | Tag Dimension |
|---|---|
| `brand` | `brand_tier` |
| `price` | `price` |
| `nib` | `nib_type` |
| `origin` | `origin` |
| `fill` | `fill_system` |
| `usage` | `usage` |
| `era` | `era` |
| `size` | `size` |
| `material` | `body_material` |

## API Shapes

### `GET /api/search`

Query parameters:

- `q`: string, trimmed and capped to 100 characters
- `page`: positive integer, default `1`
- `limit`: positive integer, default `20`, max `50`

Response:

```ts
{
  results: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    name_highlight: string;
    summary_highlight: string;
    body_highlight: string;
    rank: number;
  }>;
  total: number;
  page: number;
  limit: number;
  query: string;
}
```

Highlight fields are HTML-safe strings where the only intended HTML tag is `<mark>`.

### `GET /api/browse`

Query parameters:

- `page`: positive integer
- `limit`: positive integer, max `50`
- any supported facet dimension with a tag slug value

Response:

```ts
{
  entities: Array<{
    id: string;
    type: string;
    slug: string;
    name: string;
    summary: string | null;
    image_url: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
  facets: Record<string, Array<{ slug: string; name: string; count: number }>>;
  activeFilters: Record<string, string>;
}
```

### `GET /api/links`

Query parameters:

- `entity_id`: required entity id
- `depth`: `1` or `2`, capped at `2`

Response:

```ts
{
  forward: unknown[];
  backlinks: unknown[];
  secondHopForward?: unknown[];
  secondHopBacklinks?: unknown[];
}
```

Write operations on `/api/links` should not be public in production.

## Contract Checks

Run:

```bash
npm run check:data-contract
```

The check verifies that:

- database entity types are within the v1 type set
- the local `entities` table CHECK constraint contains every v1 type
- tag dimensions required by browse exist

