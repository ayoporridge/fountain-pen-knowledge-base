import Link from "next/link";
import type { SourceItemRecord } from "@/lib/library";
import {
  displayPublicSourceName,
  displayPublicSourceTitle,
} from "@/lib/publicText";

const ITEM_TYPE_LABELS: Record<string, string> = {
  article: "文章",
  article_reference: "参考文章",
  blog_post: "博客文章",
  blog_article: "博客文章",
  brand_profile: "品牌资料",
  catalog: "目录",
  collector_reference: "收藏资料",
  community_index: "社区索引",
  distributor_history: "经销商历史",
  encyclopedia: "百科条目",
  filling_system_reference: "上墨资料",
  forum_thread: "论坛讨论",
  forum_review: "论坛评测",
  history_article: "历史文章",
  image: "图片",
  interview_article: "访谈文章",
  manufacturing_profile: "制造资料",
  manufacturer_directory: "厂商目录",
  manufacturer_profile: "厂商资料",
  media_file: "媒体文件",
  media_search: "媒体搜索",
  model_profile: "型号资料",
  news_article: "新闻",
  nib_reference: "笔尖资料",
  official_about: "官方介绍",
  official_accessory_page: "官方配件页",
  official_brand_page: "官方品牌页",
  official_brand_profile: "官方品牌资料",
  official_brand_site: "官方品牌站",
  official_collection: "官方系列页",
  official_company: "官方公司页",
  official_company_page: "官方公司页",
  official_company_profile: "官方公司资料",
  official_design_page: "官方设计页",
  official_history: "官方历史",
  official_history_blog: "官方历史文章",
  official_mechanism_page: "官方机制页",
  official_news: "官方新闻",
  official_product_page: "官方产品页",
  official_product: "官方产品页",
  official_product_article: "官方产品文章",
  official_product_history: "官方产品历史",
  official_product_index: "官方产品索引",
  official_series_page: "官方系列页",
  official_story_page: "官方故事页",
  profile_article: "资料文章",
  reference_index: "资料索引",
  reference_article: "参考文章",
  repair_article: "维修文章",
  repair_reference: "维修资料",
  research_index: "资料索引",
  retailer_catalog: "零售目录",
  review: "评测",
  review_article: "评测文章",
  review_index: "评测索引",
  secondary_history: "二级历史资料",
  site_original_image: "站内原创图",
  specialist_article: "专题文章",
  technical_reference: "技术资料",
  video_review: "视频评测",
  wikidata_item: "Wikidata 条目",
};

type SourceCardsProps = {
  sources: SourceItemRecord[];
  variant?: "cards" | "compact";
};

export function SourceCards({ sources, variant = "cards" }: SourceCardsProps) {
  if (sources.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
        暂无可展示来源。
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <ul
        className="space-y-1.5 text-xs leading-relaxed"
        style={{ color: "var(--color-ink-muted)" }}
      >
        {sources.map((source) => (
          <li key={source.id} className="flex flex-wrap items-baseline gap-x-2">
            <Link
              href={source.url}
              className="ink-underline font-medium"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {displayPublicSourceTitle(source.title)}
            </Link>
            <span>
              {displayPublicSourceName(source.source_name)}
              {ITEM_TYPE_LABELS[source.item_type]
                ? ` · ${ITEM_TYPE_LABELS[source.item_type]}`
                : ""}
            </span>
            {source.reference_count > 0 && (
              <span>引用 {source.reference_count}</span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="grid gap-2">
      {sources.map((source) => (
        <Link
          key={source.id}
          href={source.url}
          className="rounded-lg border p-3 transition-colors hover:bg-[var(--color-surface-dim)]"
          style={{
            borderColor: "var(--color-border-light)",
            color: "var(--color-ink)",
          }}
        >
          <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              {displayPublicSourceName(source.source_name)}
            </span>
            <span
              className="text-xs"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {ITEM_TYPE_LABELS[source.item_type] || "资料"}
            </span>
          </div>
          <div className="text-sm font-medium">
            {displayPublicSourceTitle(source.title)}
          </div>
          <div
            className="mt-1 flex flex-wrap gap-2 text-xs"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {source.reference_count > 0 && (
              <span>引用 {source.reference_count}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
