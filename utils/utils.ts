const trimText = (text: string, maxTitleLength: number): string => {
  if (!text) {
    return "";
  }
  if (text.length <= maxTitleLength) {
    return text;
  }
  let trimmedText = text.substring(0, maxTitleLength - 2);
  const lastSpaceIndex = trimmedText.lastIndexOf(" ");

  if (lastSpaceIndex !== -1) {
    trimmedText = trimmedText.substring(0, lastSpaceIndex);
  }
  return trimmedText + "...";
};

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const formatCount = (num: number) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

export { trimText, formatCount };
