import { type Prefecture } from "app/lib/constants";
import { prisma } from "app/servers/db.server";
import { lookupPrefectureFromMaxmind } from "./maxmind.server";
import { fetchFromIpApi } from "./ip-api.server";

const CACHE_TTL_DAYS = 30;

export async function getPrefectureFromIp(
  ip?: string,
): Promise<Prefecture | null> {
  // IPアドレスがない場合はnullを返す
  if (!ip) {
    return null;
  }

  // プライベートIPや無効値は外部APIを叩かずに終了
  if (isPrivateOrInvalidIp(ip)) {
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

    // 2. まず MaxMind のローカルDBを使って判定
    const prefectureFromMaxmind = await lookupPrefectureFromMaxmind(ip);
    if (prefectureFromMaxmind) {
      await cachePrefecture(ip, prefectureFromMaxmind);
      return prefectureFromMaxmind;
    }

    // 3. MaxMindで取れなかった場合のみ外部API（複数プロバイダ + タイムアウト付き）を呼ぶ
    const prefecture = await fetchFromIpApi(ip);
    if (prefecture) {
      await cachePrefecture(ip, prefecture);
      return prefecture;
    }

    // 429やタイムアウトなどで失敗した場合はステイルキャッシュを返す
    if (cached) {
      return cached.prefecture as Prefecture;
    }

    // デフォルトは東京都にしておく
    return "東京都";
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

function isPrivateOrInvalidIp(ip: string) {
  return (
    // ループバック(自分自身)
    /^127\./.test(ip) ||
    // プライベート
    /^10\./.test(ip) ||
    // プライベート
    /^192\.168\./.test(ip) ||
    // プライベート
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    // ループバック(IPv6)
    /^::1$/.test(ip) ||
    // ローカルリンク
    /^fe80:/i.test(ip)
  );
}

async function cachePrefecture(ip: string, prefecture: Prefecture) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

  await prisma.ipGeolocationCache.create({
    data: {
      ip,
      prefecture,
      expiresAt,
    },
  });
}
