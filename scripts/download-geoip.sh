#!/bin/sh

set -a
[ -f .env ] && . ./.env
set +a

if [ -z "$MAXMIND_LICENSE_KEY" ]; then
  echo "MAXMIND_LICENSE_KEY がありません"
  exit 1
fi

curl -s -L \
  "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=$MAXMIND_LICENSE_KEY&suffix=tar.gz" \
  | tar zx

# 展開されたディレクトリ名を特定（GeoLite2-City_YYYYMMDD）
UNPACKED_DIR=$(find . -maxdepth 1 -type d -name "GeoLite2-City_*" | head -n 1)

if [ -z "$UNPACKED_DIR" ]; then
  echo "解凍されたフォルダが見つかリません"
  exit 1
fi

# 固定パスへ移動
mkdir -p geoip

if [ ! -f "$UNPACKED_DIR/GeoLite2-City.mmdb" ]; then
  echo "mmdb が見つかりません"
  exit 1
fi

mv "$UNPACKED_DIR/GeoLite2-City.mmdb" geoip/GeoLite2-City.mmdb

rm -rf "$UNPACKED_DIR"

echo "geoip/GeoLite2-City.mmdb に配置完了！"