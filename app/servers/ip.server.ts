/**
 * リクエストからIPアドレスを取得
 */
export function getClientIP(request: Request): string | null {
  // Shopifyやプロキシ経由の場合、X-Forwarded-ForヘッダーからIPを取得
  const forwardedFor = request.headers.get("X-Forwarded-For");
  if (forwardedFor) {
    // カンマ区切りの場合、最初のIPを使用
    return forwardedFor.split(",")[0].trim();
  }

  // X-Real-IPヘッダー
  const realIP = request.headers.get("X-Real-IP");
  if (realIP) {
    return realIP;
  }

  // CF-Connecting-IP (Cloudflare)
  const cfIP = request.headers.get("CF-Connecting-IP");
  if (cfIP) {
    return cfIP;
  }

  return null;
}
