export function toPlainTextSummary(value: string, maxLength = 240) {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed !== "---" &&
        !trimmed.startsWith("![") &&
        !trimmed.startsWith("<img")
      );
    })
    .join(" ")
    .replace(/!\[[^\]]*(?:\]\([^)]+\))?/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/^>\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s*>\s*/g, " ")
    .replace(/\s*---+\s*/g, " ")
    .replace(/\|/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!normalized || normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}…`;
}
