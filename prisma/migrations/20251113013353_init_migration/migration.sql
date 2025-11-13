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
CREATE TABLE "NonShippingDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "shop" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reason" TEXT,
    "dayOfWeek" INTEGER
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "country" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ShippingConfig_shop_key" ON "ShippingConfig"("shop");

-- CreateIndex
CREATE INDEX "RegionalShippingTime_shop_idx" ON "RegionalShippingTime"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalShippingTime_shop_prefecture_key" ON "RegionalShippingTime"("shop", "prefecture");

-- CreateIndex
CREATE INDEX "NonShippingDay_shop_date_idx" ON "NonShippingDay"("shop", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NonShippingDay_shop_date_key" ON "NonShippingDay"("shop", "date");

-- CreateIndex
CREATE INDEX "Holiday_year_idx" ON "Holiday"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_country_date_key" ON "Holiday"("country", "date");
