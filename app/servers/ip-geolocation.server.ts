import { PREFECTURES, type Prefecture } from "app/lib/constants";
import { prisma } from "app/servers/db.server";

/**
 * IPアドレスから都道府県を推定する（キャッシュ機能付き）
 * @param ip IPアドレス（省略時はリクエスト元のIPを使用）
 * @returns 都道府県名、またはnull
 */
export async function getPrefectureFromIP(
  ip?: string,
): Promise<Prefecture | null> {
  // IPアドレスがない場合はnullを返す
  if (!ip) {
    return null;
  }

  try {
    // 1. キャッシュから取得を試みる
    const cached = await prisma.ipGeolocationCache.findFirst({
      where: { ip },
      orderBy: { expiresAt: "desc" },
    });

    if (cached && cached.expiresAt > new Date()) {
      // キャッシュが有効な場合
      return cached.prefecture as Prefecture;
    }

    // 2. キャッシュがない、または期限切れの場合、APIを呼び出す
    const apiUrl = `https://ipapi.co/${ip}/json/`;

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "shopify-estimated-delivery-date/1.0",
      },
    });

    // 3. 429エラー（レート制限）の場合、期限切れのキャッシュでも返す
    if (response.status === 429) {
      console.warn(
        "IP geolocation API rate limit (429). Using expired cache if available.",
      );
      if (cached) {
        // 期限切れでもキャッシュがあれば返す
        return cached.prefecture as Prefecture;
      }
      return null;
    }

    if (!response.ok) {
      console.error("IP geolocation API error:", response.status);
      // エラー時も期限切れのキャッシュがあれば返す
      if (cached) {
        return cached.prefecture as Prefecture;
      }
      return null;
    }

    const data = await response.json();

    // 日本以外の場合はnullを返す
    if (data.country_code !== "JP") {
      return null;
    }

    // region_codeから都道府県を推定
    // ipapi.coは日本の場合、region_codeに都道府県コード（ISO 3166-2:JP）を返す
    const prefecture = mapRegionCodeToPrefecture(data.region_code, data.region);

    if (prefecture) {
      // 4. 成功した場合、キャッシュに保存（30日間有効）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await prisma.ipGeolocationCache.create({
        data: {
          ip,
          prefecture,
          expiresAt,
        },
      });
    }

    return prefecture;
  } catch (error) {
    console.error("IP geolocation error:", error);

    // エラー時も期限切れのキャッシュがあれば返す
    try {
      const cached = await prisma.ipGeolocationCache.findFirst({
        where: { ip },
        orderBy: { expiresAt: "desc" },
      });
      if (cached) {
        return cached.prefecture as Prefecture;
      }
    } catch (cacheError) {
      console.error("Failed to get cached IP geolocation:", cacheError);
    }

    return null;
  }
}

/**
 * リージョンコードまたはリージョン名から都道府県にマッピング
 */
function mapRegionCodeToPrefecture(
  regionCode?: string,
  regionName?: string,
): Prefecture | null {
  if (!regionCode && !regionName) {
    return null;
  }

  // ISO 3166-2:JP コードから都道府県へのマッピング
  const codeMap: Record<string, Prefecture> = {
    "01": "北海道",
    "02": "青森県",
    "03": "岩手県",
    "04": "宮城県",
    "05": "秋田県",
    "06": "山形県",
    "07": "福島県",
    "08": "茨城県",
    "09": "栃木県",
    "10": "群馬県",
    "11": "埼玉県",
    "12": "千葉県",
    "13": "東京都",
    "14": "神奈川県",
    "15": "新潟県",
    "16": "富山県",
    "17": "石川県",
    "18": "福井県",
    "19": "山梨県",
    "20": "長野県",
    "21": "岐阜県",
    "22": "静岡県",
    "23": "愛知県",
    "24": "三重県",
    "25": "滋賀県",
    "26": "京都府",
    "27": "大阪府",
    "28": "兵庫県",
    "29": "奈良県",
    "30": "和歌山県",
    "31": "鳥取県",
    "32": "島根県",
    "33": "岡山県",
    "34": "広島県",
    "35": "山口県",
    "36": "徳島県",
    "37": "香川県",
    "38": "愛媛県",
    "39": "高知県",
    "40": "福岡県",
    "41": "佐賀県",
    "42": "長崎県",
    "43": "熊本県",
    "44": "大分県",
    "45": "宮崎県",
    "46": "鹿児島県",
    "47": "沖縄県",
  };

  // リージョンコードからマッピング
  if (regionCode) {
    // "JP-13" のような形式を "13" に変換
    const code = regionCode.replace("JP-", "");
    if (codeMap[code]) {
      return codeMap[code];
    }
  }

  // リージョン名から部分一致で検索
  if (regionName) {
    const normalizedRegionName = regionName.trim();
    for (const prefecture of PREFECTURES) {
      if (
        prefecture.includes(normalizedRegionName) ||
        normalizedRegionName.includes(prefecture.replace(/[都道府県]/g, ""))
      ) {
        return prefecture;
      }
    }
  }

  return null;
}
