-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);

-- CreateTable
CREATE TABLE "ShippingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shop" TEXT NOT NULL,
    "preparationDays" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "RegionalShippingTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shop" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "shippingDays" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "WeeklyNonShippingDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shop" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "CustomNonShippingDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shop" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT
);

-- CreateTable
CREATE TABLE "IpGeolocationCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ip" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingConfig_shop_key" ON "ShippingConfig"("shop");

-- CreateIndex
CREATE INDEX "RegionalShippingTime_shop_idx" ON "RegionalShippingTime"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalShippingTime_shop_prefecture_key" ON "RegionalShippingTime"("shop", "prefecture");

-- CreateIndex
CREATE INDEX "WeeklyNonShippingDay_shop_idx" ON "WeeklyNonShippingDay"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyNonShippingDay_shop_dayOfWeek_key" ON "WeeklyNonShippingDay"("shop", "dayOfWeek");

-- CreateIndex
CREATE INDEX "CustomNonShippingDay_shop_date_idx" ON "CustomNonShippingDay"("shop", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CustomNonShippingDay_shop_date_key" ON "CustomNonShippingDay"("shop", "date");

-- CreateIndex
CREATE INDEX "IpGeolocationCache_ip_idx" ON "IpGeolocationCache"("ip");

-- CreateIndex
CREATE INDEX "IpGeolocationCache_expiresAt_idx" ON "IpGeolocationCache"("expiresAt");
