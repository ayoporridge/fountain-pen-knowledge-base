import { SearchExplorer } from "@/components/SearchExplorer";
import { searchPublicEntities } from "@/lib/search";

export const revalidate = 600;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = value || "";
  const initialData = await searchPublicEntities({ query, limit: 30 });
  return <SearchExplorer initialData={initialData} />;
}
