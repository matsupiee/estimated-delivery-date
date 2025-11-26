FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json* ./

# lockfile どおりに production 依存だけ をインストール
# npm postinstall も実行される
# cache cleanで、キャッシュを強制削除
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN npm run build

# Prisma Clientを生成
RUN npx prisma generate

# 起動時にマイグレーションを適用してからサーバーを起動
# && で連結することで、マイグレーションが失敗したらサーバーが起動しないようになる
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
