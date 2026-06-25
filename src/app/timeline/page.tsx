import { ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { Timeline } from "@/components/library/Timeline";
import { getRecentTimeline } from "@/lib/library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "历史时间线 - 钢笔图书馆",
  description: "按时间浏览品牌、型号、工艺与社区事件。",
};

export default async function TimelinePage() {
  const events = await getRecentTimeline(160);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 max-w-3xl">
        <p
          className="mb-2 flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <ClockCounterClockwise size={16} />
          Library Timeline
        </p>
        <h1 className="mb-3 text-3xl font-bold tracking-tight">历史时间线</h1>
        <p
          className="text-base leading-relaxed"
          style={{ color: "var(--color-ink-light)" }}
        >
          把品牌创立、型号发布、工艺节点、复刻和社区事件放在同一条时间轴上，先显示已进入资料库的内容。
        </p>
      </div>

      <div
        className="rounded-xl border p-5"
        style={{
          borderColor: "var(--color-border)",
          backgroundColor: "var(--color-surface-raised)",
        }}
      >
        <Timeline events={events} />
      </div>
    </div>
  );
}
