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

  // 定期休業日（曜日）を取得
  const weeklyNonShippingDays = await prisma.weeklyNonShippingDay.findMany({
    where: { shop },
  });

  // カスタム休業日を取得
  const customNonShippingDays = await prisma.customNonShippingDay.findMany({
    where: { shop },
    orderBy: { date: "asc" },
  });

  return {
    preparationDays: config?.preparationDays ?? 1,
    regionalMap,
    weeklyNonShippingDays: weeklyNonShippingDays.map((day) => day.dayOfWeek),
    customNonShippingDays: customNonShippingDays.map((day) => ({
      id: day.id,
      date: day.date.toISOString(),
      reason: day.reason,
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
    const daysOfWeekJson = formData.get("daysOfWeek") as string;
    const daysOfWeek: number[] = JSON.parse(daysOfWeekJson);

    // 既存の定期休業日を削除
    await prisma.weeklyNonShippingDay.deleteMany({
      where: { shop },
    });

    // 選択された曜日を登録
    if (daysOfWeek.length > 0) {
      await prisma.weeklyNonShippingDay.createMany({
        data: daysOfWeek.map((dayOfWeek) => ({ shop, dayOfWeek })),
      });
    }
    return { success: true, message: "定期休業日を保存しました" };
  }

  if (actionType === "addCustomHoliday") {
    const date = new Date(formData.get("date") as string);
    const reason = (formData.get("reason") as string) || null;
    await prisma.customNonShippingDay.create({
      data: { shop, date, reason },
    });
    return { success: true, message: "休業日を追加しました" };
  }

  if (actionType === "deleteHoliday") {
    const id = formData.get("id") as string;
    await prisma.customNonShippingDay.delete({ where: { id } });
    return { success: true, message: "休業日を削除しました" };
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
            weeklyNonShippingDays={loaderData.weeklyNonShippingDays}
            customNonShippingDays={loaderData.customNonShippingDays}
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
