/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 */
export function formatDateToYyyyMmDd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付を日本語形式にフォーマット
 * 例: 2025-11-20 → "11月20日（木）"
 */
export function formatJapaneseDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][date.getDay()];

  return `${month}月${day}日（${dayOfWeek}）`;
}
