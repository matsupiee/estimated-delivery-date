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
): Promise<{
  date: Date | null;
  error: string | null;
}> {
  // 1. ShippingConfigから発送準備日数を取得
  const config = await prisma.shippingConfig.findUnique({
    where: { shop },
  });

  if (!config) {
    return {
      date: null,
      error: `発送準備日数が未登録: ${shop}`,
    };
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
    return {
      date: null,
      error: `地域設定が未登録: ${shop} ${prefecture}`,
    };
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

  return {
    date: deliveryDate,
    error: null,
  };
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

  // 定期休業日（曜日）を取得
  const weeklyNonShippingDays = await prisma.weeklyNonShippingDay.findMany({
    where: { shop },
  });

  // カスタム休業日を取得
  const customNonShippingDays = await prisma.customNonShippingDay.findMany({
    where: { shop },
  });

  while (addedDays < businessDays) {
    currentDate.setDate(currentDate.getDate() + 1);

    if (!isNonShippingDay(currentDate, weeklyNonShippingDays, customNonShippingDays)) {
      addedDays++;
    }
  }

  return currentDate;
}

/**
 * 指定日が休業日かどうかを判定
 * @param date 判定する日付
 * @param weeklyNonShippingDays 定期休業日（曜日）リスト
 * @param customNonShippingDays カスタム休業日リスト
 * @returns 休業日の場合true
 */
function isNonShippingDay(
  date: Date,
  weeklyNonShippingDays: Array<{ dayOfWeek: number }>,
  customNonShippingDays: Array<{ date: Date }>,
): boolean {
  const dateString = formatDateToYyyyMmDd(date);
  const dayOfWeek = date.getDay(); // 0=日曜, 6=土曜

  // 1. 定期休業（毎週土日など）
  const hasWeeklyHoliday = weeklyNonShippingDays.some(
    (day) => day.dayOfWeek === dayOfWeek,
  );

  if (hasWeeklyHoliday) {
    return true;
  }

  // 2. カスタム休業日
  const hasCustomHoliday = customNonShippingDays.some(
    (day) => formatDateToYyyyMmDd(day.date) === dateString,
  );

  return hasCustomHoliday;
}
