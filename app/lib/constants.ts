export const CONTACT_EMAIL_TO = "cs.estimated.delivery.app@gmail.com";

/**
 * 日本の都道府県一覧
 * クライアントサイドでも使用可能な定数
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

/**
 * 地域ごとの都道府県グルーピング
 */
export const REGIONS: Record<string, Prefecture[]> = {
  北海道: ["北海道"],
  東北: ["青森県", "岩手県", "秋田県", "宮城県", "山形県", "福島県"],
  関東: [
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
  ],
  北陸: ["新潟県", "富山県", "石川県", "福井県"],
  中部: ["山梨県", "長野県", "岐阜県", "静岡県", "愛知県"],
  関西: [
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
  ],
  中国: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
  四国: ["徳島県", "香川県", "愛媛県", "高知県"],
  九州: [
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
  ],
  沖縄: ["沖縄県"],
} as const;

export type RegionName = keyof typeof REGIONS;

export const REGION_COLORS: Record<RegionName, string> = {
  北海道: "#8bcf5a",
  東北: "#f6c24a",
  関東: "#f49390",
  北陸: "#f7d18d",
  中部: "#f2a65a",
  関西: "#b982c2",
  中国: "#7bb6ff",
  四国: "#5ccadf",
  九州: "#7a8ef8",
  沖縄: "#3abf9a",
} as const;

export const REGION_SVG_PATHS: Record<RegionName, string> = {
  北海道:
    "M476 91 L517 91 L557 131 L577 131 L577 179 L488 179 L488 194 L452 194 L452 159 L476 145 Z",
  東北: "M451 217 L477 217 L477 224 L491 224 L491 208 L508 208 L508 226 L526 239 L526 264 L519 271 L519 325 L461 325 L458 307 L458 288 L451 288 Z",
  関東: "M438 325 L519 325 L519 353 L526 369 L526 427 L504 427 L504 396 L487 396 L487 423 L459 423 L459 405 L425 399 L425 377 L438 377 Z",
  北陸: "M341 351 L360 338 L360 313 L377 313 L377 331 L389 331 L430 301 L420 293 L417 296 L407 296 L418 285 L429 285 L422 292 L433 300 L451 288 L458 288 L458 310 L461 324 L437 324 L437 375 L425 375 L425 400 L403 400 L403 344 L378 344 L378 372 L324 372 L324 362 L341 362 Z",
  中部: "M379 345 L402 345 L402 401 L425 401 L458 406 L458 424 L468 424 L468 436 L449 436 L449 425 L442 418 L424 436 L378 436 L378 414 L365 414 L365 450 L346 450 L346 394 L371 394 L371 373 L379 373 Z",
  関西: "M274 358 L323 358 L323 373 L371 373 L371 394 L344 394 L344 450 L301 450 L301 408 L274 408 Z",
  中国: "M210 358 L274 358 L274 408 L187 408 L187 378 L209 359 Z",
  四国: "M195 421 L227 414 L228 423 L247 423 L247 418 L289 418 L289 468 L267 468 L257 459 L226 459 L216 467 L190 467 L190 423 Z",
  九州: "M77 378 L150 378 L179 398 L179 422 L171 429 L171 460 L146 473 L146 453 L131 453 L131 463 L114 463 L114 431 L122 431 L122 411 L119 404 L112 404 L99 404 L99 419 L76 419 Z",
  沖縄: "M70 60 L140 60 L120 110 L55 110 Z",
} as const;

const prefectureRegionMap: Partial<Record<Prefecture, RegionName>> = {};
(Object.entries(REGIONS) as [RegionName, readonly Prefecture[]][]).forEach(
  ([region, prefectures]) => {
    prefectures.forEach((prefecture) => {
      prefectureRegionMap[prefecture] = region;
    });
  },
);

export const PREFECTURE_TO_REGION = prefectureRegionMap as Record<
  Prefecture,
  RegionName
>;

export type RegionLeadTimeRange = {
  min: number;
  max: number;
};

export const REGION_LEAD_TIME: Record<
  RegionName,
  Record<RegionName, RegionLeadTimeRange>
> = {
  北海道: {
    北海道: { min: 1, max: 1 },
    東北: { min: 2, max: 2 },
    関東: { min: 2, max: 2 },
    北陸: { min: 2, max: 2 },
    中部: { min: 2, max: 2 },
    関西: { min: 2, max: 3 },
    中国: { min: 2, max: 3 },
    四国: { min: 2, max: 3 },
    九州: { min: 3, max: 4 },
    沖縄: { min: 3, max: 4 },
  },
  東北: {
    北海道: { min: 2, max: 2 },
    東北: { min: 1, max: 1 },
    関東: { min: 1, max: 1 },
    北陸: { min: 1, max: 2 },
    中部: { min: 1, max: 2 },
    関西: { min: 1, max: 2 },
    中国: { min: 1, max: 2 },
    四国: { min: 2, max: 2 },
    九州: { min: 2, max: 3 },
    沖縄: { min: 3, max: 3 },
  },
  関東: {
    北海道: { min: 2, max: 2 },
    東北: { min: 1, max: 1 },
    関東: { min: 1, max: 1 },
    北陸: { min: 1, max: 2 },
    中部: { min: 1, max: 1 },
    関西: { min: 1, max: 1 },
    中国: { min: 1, max: 2 },
    四国: { min: 1, max: 2 },
    九州: { min: 2, max: 2 },
    沖縄: { min: 3, max: 3 },
  },
  北陸: {
    北海道: { min: 2, max: 2 },
    東北: { min: 1, max: 2 },
    関東: { min: 1, max: 1 },
    北陸: { min: 1, max: 1 },
    中部: { min: 1, max: 1 },
    関西: { min: 1, max: 1 },
    中国: { min: 1, max: 2 },
    四国: { min: 1, max: 2 },
    九州: { min: 2, max: 2 },
    沖縄: { min: 3, max: 3 },
  },
  中部: {
    北海道: { min: 2, max: 2 },
    東北: { min: 1, max: 2 },
    関東: { min: 1, max: 1 },
    北陸: { min: 1, max: 1 },
    中部: { min: 1, max: 1 },
    関西: { min: 1, max: 1 },
    中国: { min: 1, max: 2 },
    四国: { min: 1, max: 2 },
    九州: { min: 2, max: 2 },
    沖縄: { min: 3, max: 3 },
  },
  関西: {
    北海道: { min: 2, max: 3 },
    東北: { min: 1, max: 2 },
    関東: { min: 1, max: 1 },
    北陸: { min: 1, max: 1 },
    中部: { min: 1, max: 1 },
    関西: { min: 1, max: 1 },
    中国: { min: 1, max: 1 },
    四国: { min: 1, max: 1 },
    九州: { min: 1, max: 2 },
    沖縄: { min: 3, max: 3 },
  },
  中国: {
    北海道: { min: 2, max: 3 },
    東北: { min: 1, max: 2 },
    関東: { min: 1, max: 2 },
    北陸: { min: 1, max: 2 },
    中部: { min: 1, max: 2 },
    関西: { min: 1, max: 1 },
    中国: { min: 1, max: 1 },
    四国: { min: 1, max: 1 },
    九州: { min: 1, max: 1 },
    沖縄: { min: 2, max: 3 },
  },
  四国: {
    北海道: { min: 2, max: 3 },
    東北: { min: 1, max: 2 },
    関東: { min: 1, max: 2 },
    北陸: { min: 1, max: 2 },
    中部: { min: 1, max: 2 },
    関西: { min: 1, max: 1 },
    中国: { min: 1, max: 1 },
    四国: { min: 1, max: 1 },
    九州: { min: 1, max: 1 },
    沖縄: { min: 2, max: 3 },
  },
  九州: {
    北海道: { min: 3, max: 4 },
    東北: { min: 2, max: 3 },
    関東: { min: 2, max: 2 },
    北陸: { min: 2, max: 2 },
    中部: { min: 2, max: 2 },
    関西: { min: 1, max: 2 },
    中国: { min: 1, max: 1 },
    四国: { min: 1, max: 1 },
    九州: { min: 1, max: 1 },
    沖縄: { min: 2, max: 2 },
  },
  沖縄: {
    北海道: { min: 3, max: 4 },
    東北: { min: 3, max: 3 },
    関東: { min: 3, max: 3 },
    北陸: { min: 3, max: 3 },
    中部: { min: 3, max: 3 },
    関西: { min: 3, max: 3 },
    中国: { min: 3, max: 3 },
    四国: { min: 3, max: 3 },
    九州: { min: 2, max: 2 },
    沖縄: { min: 1, max: 1 },
  },
};
