export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-pulse">
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  );
}
