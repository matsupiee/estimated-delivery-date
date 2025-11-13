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
  中部: [
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
  ],
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
  中部: "#f2a65a",
  関西: "#b982c2",
  中国: "#7bb6ff",
  四国: "#5ccadf",
  九州: "#7a8ef8",
  沖縄: "#3abf9a",
} as const;

export type RegionGridPlacement = {
  columnStart: number;
  columnEnd: number;
  rowStart: number;
  rowEnd: number;
};

export const REGION_GRID_PLACEMENT: Record<RegionName, RegionGridPlacement> = {
  北海道: { columnStart: 8, columnEnd: 12, rowStart: 1, rowEnd: 4 },
  東北: { columnStart: 7, columnEnd: 11, rowStart: 4, rowEnd: 7 },
  関東: { columnStart: 6, columnEnd: 10, rowStart: 6, rowEnd: 9 },
  中部: { columnStart: 5, columnEnd: 9, rowStart: 8, rowEnd: 11 },
  関西: { columnStart: 4, columnEnd: 8, rowStart: 10, rowEnd: 13 },
  中国: { columnStart: 3, columnEnd: 7, rowStart: 12, rowEnd: 15 },
  四国: { columnStart: 4, columnEnd: 6, rowStart: 15, rowEnd: 17 },
  九州: { columnStart: 2, columnEnd: 6, rowStart: 16, rowEnd: 19 },
  沖縄: { columnStart: 9, columnEnd: 11, rowStart: 19, rowEnd: 21 },
} as const;
