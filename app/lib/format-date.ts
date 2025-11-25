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

/**
 * 日付を英語形式にフォーマット
 * 例: 2025-11-20 → "Nov 20th (Thu)"
 */
export function formatEnglishDate(date: Date): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const dayName = dayOfWeek[date.getDay()];

  // 序数詞を追加 (1st, 2nd, 3rd, 4th, etc.)
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";

  return `${month} ${day}${suffix} (${dayName})`;
}

/**
 * ロケールに応じて日付をフォーマット
 * @param date フォーマットする日付
 * @param locale ロケール ('ja' または 'en', デフォルトは 'en')
 */
export function formatDateByLocale(date: Date, locale: string = "en"): string {
  if (locale.startsWith("ja")) {
    return formatJapaneseDate(date);
  }
  return formatEnglishDate(date);
}
