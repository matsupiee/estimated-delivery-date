import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../servers/shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { prisma } from "app/servers/db.server";
import {
  AccordionSection,
  type SectionId,
} from "../components/settings/AccordionSection";
import { BasicSettingsSection } from "../components/settings/BasicSettingsSection";
import { RegionSettingsSection } from "../components/settings/RegionSettingsSection";
import { HolidaySettingsSection } from "../components/settings/HolidaySettingsSection";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const config = await prisma.shippingConfig.findUnique({
    where: { shop },
  });

  const regionalTimes = await prisma.regionalShippingTime.findMany({
    where: { shop },
  });
  const regionalMap: Record<string, number> = {};
  regionalTimes.forEach((rt) => {
    regionalMap[rt.prefecture] = rt.shippingDays;
  });

  const nonShippingDays = await prisma.nonShippingDay.findMany({
    where: { shop },
    orderBy: { date: "asc" },
  });

  return {
    preparationDays: config?.preparationDays ?? 1,
    regionalMap,
    nonShippingDays: nonShippingDays.map((day) => ({
      id: day.id,
      date: day.date.toISOString(),
      reason: day.reason,
      dayOfWeek: day.dayOfWeek,
    })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  if (actionType === "saveBasic") {
    const preparationDays = parseInt(
      formData.get("preparationDays") as string,
      10
    );
    await prisma.shippingConfig.upsert({
      where: { shop },
      create: { shop, preparationDays },
      update: { preparationDays },
    });
    return { success: true, message: "設定を保存しました", actionType: "saveBasic" };
  }

  if (actionType === "saveRegions") {
    const regionalDataJson = formData.get("regionalData") as string;
    const regionalData: Record<string, number> = JSON.parse(regionalDataJson);
    await Promise.all(
      Object.entries(regionalData).map(([prefecture, shippingDays]) =>
        prisma.regionalShippingTime.upsert({
          where: { shop_prefecture: { shop, prefecture } },
          create: { shop, prefecture, shippingDays },
          update: { shippingDays },
        })
      )
    );
    return { success: true, message: "地域別配送日数を保存しました", actionType: "saveRegions" };
  }

  if (actionType === "setWeeklyHolidays") {
    const saturday = formData.get("saturday") === "true";
    const sunday = formData.get("sunday") === "true";

    await prisma.nonShippingDay.deleteMany({
      where: { shop, dayOfWeek: { not: null } },
    });

    const holidays = [];
    if (saturday) {
      holidays.push({
        shop,
        date: new Date("2025-01-01"),
        dayOfWeek: 6,
        reason: "定休日（土曜日）",
      });
    }
    if (sunday) {
      holidays.push({
        shop,
        date: new Date("2025-01-01"),
        dayOfWeek: 0,
        reason: "定休日（日曜日）",
      });
    }
    if (holidays.length > 0) {
      await prisma.nonShippingDay.createMany({ data: holidays });
    }
    return { success: true, message: "定期休業日を保存しました" };
  }

  if (actionType === "addCustomHoliday") {
    const date = new Date(formData.get("date") as string);
    const reason = formData.get("reason") as string;
    await prisma.nonShippingDay.create({
      data: { shop, date, reason, dayOfWeek: null },
    });
    return { success: true, message: "休業日を追加しました" };
  }

  if (actionType === "deleteHoliday") {
    const id = formData.get("id") as string;
    await prisma.nonShippingDay.delete({ where: { id } });
    return { success: true, message: "休業日を削除しました" };
  }

  if (actionType === "importJapaneseHolidays") {
    const holidays2025 = [
      { date: new Date("2025-01-01"), name: "元日" },
      { date: new Date("2025-01-13"), name: "成人の日" },
      { date: new Date("2025-02-11"), name: "建国記念の日" },
      { date: new Date("2025-02-23"), name: "天皇誕生日" },
      { date: new Date("2025-03-20"), name: "春分の日" },
      { date: new Date("2025-04-29"), name: "昭和の日" },
      { date: new Date("2025-05-03"), name: "憲法記念日" },
      { date: new Date("2025-05-04"), name: "みどりの日" },
      { date: new Date("2025-05-05"), name: "こどもの日" },
      { date: new Date("2025-07-21"), name: "海の日" },
      { date: new Date("2025-08-11"), name: "山の日" },
      { date: new Date("2025-09-15"), name: "敬老の日" },
      { date: new Date("2025-09-23"), name: "秋分の日" },
      { date: new Date("2025-10-13"), name: "スポーツの日" },
      { date: new Date("2025-11-03"), name: "文化の日" },
      { date: new Date("2025-11-23"), name: "勤労感謝の日" },
    ];
    await Promise.all(
      holidays2025.map((holiday) =>
        prisma.holiday.upsert({
          where: { country_date: { country: "Japan", date: holiday.date } },
          create: {
            country: "Japan",
            date: holiday.date,
            name: holiday.name,
            year: 2025,
          },
          update: { name: holiday.name },
        })
      )
    );
    return { success: true, message: "2025年の祝日を登録しました" };
  }

  return { success: false };
};

export default function Settings() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [searchParams] = useSearchParams();

  const initialSection = (searchParams.get("section") as SectionId) || "basic";
  const [openSections, setOpenSections] = useState<Set<SectionId>>(
    new Set([initialSection])
  );

  // 基本設定
  const [preparationDays, setPreparationDays] = useState(
    loaderData.preparationDays
  );

  // 地域別配送日数
  const [regionalMap, setRegionalMap] = useState<Record<string, number>>(
    loaderData.regionalMap
  );

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message || "保存しました");

      // 保存成功時に次のセクションを開く
      const { actionType } = fetcher.data;
      if (actionType === "saveBasic") {
        setOpenSections((prev) => {
          const next = new Set(prev);
          next.delete("basic");
          next.add("regions");
          return next;
        });
      } else if (actionType === "saveRegions") {
        setOpenSections((prev) => {
          const next = new Set(prev);
          next.delete("regions");
          next.add("holidays");
          return next;
        });
      }
    }
  }, [fetcher.data, shopify]);

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 基本設定の保存
  const handleSaveBasic = () => {
    const formData = new FormData();
    formData.append("actionType", "saveBasic");
    formData.append("preparationDays", preparationDays.toString());
    fetcher.submit(formData, { method: "POST" });
  };

  // 地域別配送日数の保存
  const handleSaveRegions = () => {
    const formData = new FormData();
    formData.append("actionType", "saveRegions");
    formData.append("regionalData", JSON.stringify(regionalMap));
    fetcher.submit(formData, { method: "POST" });
  };

  // 休業日のフォーム送信
  const handleHolidaySubmit = (formData: FormData) => {
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <s-page heading="設定">
      <div style={{ maxWidth: "900px" }}>
        {/* 基本設定 */}
        <AccordionSection
          id="basic"
          title="基本設定"
          isOpen={openSections.has("basic")}
          isLast={false}
          onToggle={() => toggleSection("basic")}
        >
          <BasicSettingsSection
            preparationDays={preparationDays}
            onPreparationDaysChange={setPreparationDays}
            onSave={handleSaveBasic}
            isLoading={isLoading}
          />
        </AccordionSection>

        {/* 地域別配送日数 */}
        <AccordionSection
          id="regions"
          title="地域別配送日数"
          isOpen={openSections.has("regions")}
          isLast={false}
          onToggle={() => toggleSection("regions")}
        >
          <RegionSettingsSection
            regionalMap={regionalMap}
            onRegionalMapChange={setRegionalMap}
            onSave={handleSaveRegions}
            isLoading={isLoading}
          />
        </AccordionSection>

        {/* 休業日設定 */}
        <AccordionSection
          id="holidays"
          title="休業日設定"
          isOpen={openSections.has("holidays")}
          isLast={true}
          onToggle={() => toggleSection("holidays")}
        >
          <HolidaySettingsSection
            nonShippingDays={loaderData.nonShippingDays}
            shopify={shopify}
            onSubmit={handleHolidaySubmit}
          />
        </AccordionSection>
      </div>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
