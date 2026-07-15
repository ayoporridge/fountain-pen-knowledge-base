import type { Metadata } from "next";
import { BrowseExplorer } from "@/components/BrowseExplorer";
import { getBrowseData } from "@/lib/browse-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "浏览馆藏 - 钢笔知识图谱",
  description: "按型号、品牌、产地、笔尖、上墨方式和材质浏览钢笔资料馆。",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialData = await getBrowseData(params);
  return <BrowseExplorer initialData={initialData} />;
}
