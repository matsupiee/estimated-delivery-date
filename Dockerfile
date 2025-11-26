FROM node:20-alpine

# curlはGeoIPデータをダウンロードするために必要
RUN apk add --no-cache openssl curl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

# lockfile どおりに production 依存だけ をインストール
# cache cleanで、キャッシュを強制削除
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN npm run build

# Prisma Clientを生成
RUN npx prisma generate

# runtime（アプリ起動時）にGeoIPデータをダウンロードする(ここでやれば、ライセンスキーがビルドログに露出する恐れが減る)
# && で連結することで、マイグレーションなどが失敗したらサーバーが起動しない
CMD ["sh", "-c", "npm run download-geoip && npx prisma migrate deploy && npm run start"]
