import { formatDateToYyyyMmDd } from "app/lib/format-date";
import { prisma } from "./db.server";

/**
 * 配送予定日を計算する
 * @param shop ショップURL
 * @param prefecture 都道府県名（例: "東京都"）
 * @param orderDateTime 注文日時（省略時は現在時刻）
 * @returns 配送予定日
 */
export async function calculateDeliveryDate(
  shop: string,
  prefecture: string,
  orderDateTime: Date = new Date(),
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

  // 3. 発送準備日数を計算（締め時間を考慮）
  const effectivePreparationDays = calculateEffectivePreparationDays(
    config.preparationDays,
    config.sameDayShippingCutoffTime,
    orderDateTime,
  );

  // 4. 発送日を計算（営業日ベース）
  const shippingDate = await addBusinessDays(
    shop,
    orderDateTime,
    effectivePreparationDays,
  );

  // 5. 到着予定日を計算（発送日 + 配送日数）
  const deliveryDate = new Date(shippingDate);
  deliveryDate.setDate(deliveryDate.getDate() + regionalTime.shippingDays);

  return {
    date: deliveryDate,
    error: null,
  };
}

/**
 * 締め時間を考慮した実効発送準備日数を計算する
 * @param preparationDays 設定された発送準備日数
 * @param cutoffTime 締め時間（HH:MM形式、例: "14:00"）
 * @param orderDateTime 注文日時
 * @returns 実効発送準備日数
 */
function calculateEffectivePreparationDays(
  preparationDays: number,
  cutoffTime: string | null,
  orderDateTime: Date,
): number {
  // 締め時間は当日発送（preparationDays = 0）の場合のみ有効
  if (preparationDays !== 0) {
    return preparationDays;
  }

  // 締め時間が設定されていない場合はそのまま返す
  if (!cutoffTime) {
    return preparationDays;
  }

  // 締め時間をパース（HH:MM形式）
  const [cutoffHour, cutoffMinute] = cutoffTime.split(":").map(Number);
  if (isNaN(cutoffHour) || isNaN(cutoffMinute)) {
    return preparationDays;
  }

  // 注文時刻を取得
  const orderHour = orderDateTime.getHours();
  const orderMinute = orderDateTime.getMinutes();

  // 注文時刻が締め時間を過ぎているかチェック
  const isAfterCutoff =
    orderHour > cutoffHour ||
    (orderHour === cutoffHour && orderMinute > cutoffMinute);

  // 締め時間を過ぎていたら翌営業日発送（preparationDays = 1）
  if (isAfterCutoff) {
    return 1;
  }

  return preparationDays;
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
