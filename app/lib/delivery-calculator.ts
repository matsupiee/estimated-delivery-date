import prisma from "../db.server";

/**
 * 配送予定日を計算する
 * @param shop ショップURL
 * @param prefecture 都道府県名（例: "東京都"）
 * @param orderDate 注文日（省略時は今日）
 * @returns 配送予定日
 */
export async function calculateDeliveryDate(
  shop: string,
  prefecture: string,
  orderDate: Date = new Date(),
): Promise<Date | null> {
  // 1. ShippingConfigから発送準備日数を取得
  const config = await prisma.shippingConfig.findUnique({
    where: { shop },
  });

  if (!config) {
    return null; // 設定が未登録
  }

  // 2. RegionalShippingTimeから地域別配送日数を取得
  const regionalTime = await prisma.regionalShippingTime.findUnique({
    where: {
      shop_prefecture: {
        shop,
        prefecture,
      },
    },
  });

  if (!regionalTime) {
    return null; // 地域設定が未登録
  }

  // 3. 発送日を計算（営業日ベース）
  const shippingDate = await addBusinessDays(
    shop,
    orderDate,
    config.preparationDays,
  );

  // 4. 到着予定日を計算（発送日 + 配送日数）
  const deliveryDate = new Date(shippingDate);
  deliveryDate.setDate(deliveryDate.getDate() + regionalTime.shippingDays);

  return deliveryDate;
}

/**
 * 営業日を加算する（休業日をスキップ）
 * @param shop ショップURL
 * @param startDate 開始日
 * @param businessDays 営業日数
 * @returns 計算後の日付
 */
async function addBusinessDays(
  shop: string,
  startDate: Date,
  businessDays: number,
): Promise<Date> {
  const currentDate = new Date(startDate);
  let addedDays = 0;

  // 休業日データを事前に取得
  const nonShippingDays = await prisma.nonShippingDay.findMany({
    where: { shop },
  });

  const japaneseHolidays = await prisma.holiday.findMany({
    where: {
      year: currentDate.getFullYear(),
    },
  });

  while (addedDays < businessDays) {
    currentDate.setDate(currentDate.getDate() + 1);

    if (!isNonShippingDay(currentDate, nonShippingDays, japaneseHolidays)) {
      addedDays++;
    }
  }

  return currentDate;
}

/**
 * 指定日が休業日かどうかを判定
 * @param date 判定する日付
 * @param nonShippingDays ショップの休業日リスト
 * @param japaneseHolidays 日本の祝日リスト
 * @returns 休業日の場合true
 */
function isNonShippingDay(
  date: Date,
  nonShippingDays: Array<{
    date: Date;
    dayOfWeek: number | null;
  }>,
  japaneseHolidays: Array<{ date: Date }>,
): boolean {
  const dateString = formatDateToYYYYMMDD(date);
  const dayOfWeek = date.getDay(); // 0=日曜, 6=土曜

  // 1. 祝日チェック
  const isHoliday = japaneseHolidays.some(
    (holiday) => formatDateToYYYYMMDD(holiday.date) === dateString,
  );

  if (isHoliday) {
    return true;
  }

  // 2. ショップの定期休業（毎週土日など）
  const hasWeeklyHoliday = nonShippingDays.some(
    (day) => day.dayOfWeek === dayOfWeek,
  );

  if (hasWeeklyHoliday) {
    return true;
  }

  // 3. ショップの単発休業
  const hasCustomHoliday = nonShippingDays.some(
    (day) =>
      day.dayOfWeek === null && formatDateToYYYYMMDD(day.date) === dateString,
  );

  return hasCustomHoliday;
}

/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日本の都道府県一覧
 */
export const PREFECTURES = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
] as const;

export type Prefecture = (typeof PREFECTURES)[number];
