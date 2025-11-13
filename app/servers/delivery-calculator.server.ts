import { formatDateToYyyyMmDd } from "app/lib/format-date";
import { prisma } from "./db.server";

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
  const dateString = formatDateToYyyyMmDd(date);
  const dayOfWeek = date.getDay(); // 0=日曜, 6=土曜

  // 1. 祝日チェック
  const isHoliday = japaneseHolidays.some(
    (holiday) => formatDateToYyyyMmDd(holiday.date) === dateString,
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
      day.dayOfWeek === null && formatDateToYyyyMmDd(day.date) === dateString,
  );

  return hasCustomHoliday;
}
