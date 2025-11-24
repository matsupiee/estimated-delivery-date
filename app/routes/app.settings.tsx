import { useEffect, useMemo, useRef, useState } from "react";
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
  PREFECTURES,
  REGIONS,
  REGION_COLORS,
  REGION_LEAD_TIME,
  PREFECTURE_TO_REGION,
  type RegionName,
} from "../lib/constants";
import { RegionMap } from "../components/RegionMap";

const REGION_ENTRIES = Object.entries(REGIONS) as [
  RegionName,
  readonly string[]
][];

type SectionId = "basic" | "regions" | "holidays";

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
    return { success: true, message: "設定を保存しました" };
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
    return { success: true, message: "地域別配送日数を保存しました" };
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

// アコーディオンセクションコンポーネント
function AccordionSection({
  id,
  title,
  isOpen,
  isLast,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  isOpen: boolean;
  isLast: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      {/* 左側のプログレスバー */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "24px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: isOpen ? "#008060" : "#c9cccf",
            flexShrink: 0,
          }}
        />
        {!isLast && (
          <div
            style={{
              width: "2px",
              flex: 1,
              background: "#c9cccf",
              marginTop: "4px",
            }}
          />
        )}
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : "24px" }}>
        <button
          onClick={onToggle}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            width: "100%",
            textAlign: "left",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 600,
              color: isOpen ? "#202223" : "#6d7175",
            }}
          >
            {title}
          </h2>
          <span
            style={{
              fontSize: "12px",
              color: "#6d7175",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            ▼
          </span>
        </button>

        {isOpen && (
          <div
            style={{
              marginTop: "16px",
              paddingLeft: "4px",
              borderLeft: "2px solid #e1e3e5",
            }}
          >
            <div style={{ paddingLeft: "16px" }}>{children}</div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [factoryRegion, setFactoryRegion] = useState<RegionName>("関東");
  const [autoFillMode, setAutoFillMode] = useState<"min" | "max">("max");
  const regionInputRefs = useRef<Record<RegionName, HTMLInputElement | null>>(
    Object.keys(REGIONS).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {} as Record<RegionName, HTMLInputElement | null>
    )
  );

  // 休業日
  const [saturday, setSaturday] = useState(false);
  const [sunday, setSunday] = useState(false);
  const [customDate, setCustomDate] = useState("");
  const [customReason, setCustomReason] = useState("");

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    const hasSaturday = loaderData.nonShippingDays.some(
      (day) => day.dayOfWeek === 6
    );
    const hasSunday = loaderData.nonShippingDays.some(
      (day) => day.dayOfWeek === 0
    );
    setSaturday(hasSaturday);
    setSunday(hasSunday);
  }, [loaderData.nonShippingDays]);

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message || "保存しました");
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

  const handleRegionChange = (region: RegionName, value: string) => {
    const parsed = parseInt(value, 10);
    const days = Number.isNaN(parsed) ? 0 : parsed;
    setRegionalMap((prev) => {
      const next = { ...prev };
      REGIONS[region].forEach((prefecture) => {
        next[prefecture] = days;
      });
      return next;
    });
  };

  const getRegionInputValue = (region: RegionName) => {
    const values = REGIONS[region]
      .map((prefecture) => regionalMap[prefecture])
      .filter((value): value is number => typeof value === "number");
    if (values.length === 0) return "";
    const first = values[0];
    return values.every((value) => value === first) ? first : "";
  };

  const setDefaultValues = () => {
    const defaultMap: Record<string, number> = {};
    PREFECTURES.forEach((pref) => {
      if (pref === "北海道" || pref === "沖縄県") {
        defaultMap[pref] = 3;
      } else {
        defaultMap[pref] = 1;
      }
    });
    setRegionalMap(defaultMap);
  };

  const focusRegionInput = (region: RegionName) => {
    const target = regionInputRefs.current[region];
    if (target) {
      target.focus();
      target.select();
    }
  };

  const applyFactoryLeadTime = () => {
    const leadTimes = REGION_LEAD_TIME[factoryRegion];
    setRegionalMap((prev) => {
      const next = { ...prev };
      PREFECTURES.forEach((prefecture) => {
        const destinationRegion = PREFECTURE_TO_REGION[prefecture];
        const range = leadTimes[destinationRegion];
        if (!range) return;
        next[prefecture] = autoFillMode === "max" ? range.max : range.min;
      });
      return next;
    });
  };

  const regionValueMap = useMemo(
    () =>
      REGION_ENTRIES.reduce((acc, [region]) => {
        acc[region] = getRegionInputValue(region);
        return acc;
      }, {} as Record<RegionName, number | "">),
    [regionalMap]
  );

  // 休業日の操作
  const handleSaveWeeklyHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "setWeeklyHolidays");
    formData.append("saturday", saturday.toString());
    formData.append("sunday", sunday.toString());
    fetcher.submit(formData, { method: "POST" });
  };

  const handleAddCustomHoliday = () => {
    if (!customDate) {
      shopify.toast.show("日付を入力してください", { isError: true });
      return;
    }
    const formData = new FormData();
    formData.append("actionType", "addCustomHoliday");
    formData.append("date", customDate);
    formData.append("reason", customReason || "臨時休業");
    fetcher.submit(formData, { method: "POST" });
    setCustomDate("");
    setCustomReason("");
  };

  const handleDeleteHoliday = (id: string) => {
    const formData = new FormData();
    formData.append("actionType", "deleteHoliday");
    formData.append("id", id);
    fetcher.submit(formData, { method: "POST" });
  };

  const handleImportJapaneseHolidays = () => {
    const formData = new FormData();
    formData.append("actionType", "importJapaneseHolidays");
    fetcher.submit(formData, { method: "POST" });
  };

  const customHolidays = loaderData.nonShippingDays.filter(
    (day) => day.dayOfWeek === null
  );

  const sections: { id: SectionId; title: string }[] = [
    { id: "basic", title: "基本設定" },
    { id: "regions", title: "地域別配送日数" },
    { id: "holidays", title: "休業日設定" },
  ];

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
          <s-stack direction="block" gap="base">
            <s-paragraph>
              注文を受けてから発送までにかかる営業日数を設定してください。
            </s-paragraph>

            <s-stack direction="inline" gap="base">
              <s-text>発送準備日数:</s-text>
              <input
                type="number"
                value={preparationDays}
                onChange={(e) =>
                  setPreparationDays(parseInt(e.target.value, 10))
                }
                min="0"
                max="30"
                style={{
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "80px",
                }}
              />
              <s-text>営業日</s-text>
            </s-stack>

            <s-button
              onClick={handleSaveBasic}
              {...(isLoading ? { loading: true } : {})}
            >
              保存
            </s-button>
          </s-stack>
        </AccordionSection>

        {/* 地域別配送日数 */}
        <AccordionSection
          id="regions"
          title="地域別配送日数"
          isOpen={openSections.has("regions")}
          isLast={false}
          onToggle={() => toggleSection("regions")}
        >
          <s-stack direction="block" gap="base">
            <s-paragraph>
              地域単位で配送日数を入力すると、地図にも同じ色で反映されます。
            </s-paragraph>

            <s-button onClick={setDefaultValues} variant="secondary">
              デフォルト値を設定（北海道・沖縄: 3日、その他: 1日）
            </s-button>

            <div
              style={{
                border: "1px solid #e1e3e5",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                alignItems: "flex-end",
              }}
            >
              <div style={{ flex: "1 1 220px", minWidth: "200px" }}>
                <label
                  htmlFor="factory-region"
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  出荷工場の地域
                </label>
                <select
                  id="factory-region"
                  value={factoryRegion}
                  onChange={(e) =>
                    setFactoryRegion(e.target.value as RegionName)
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                    border: "1px solid #c9ced6",
                  }}
                >
                  {REGION_ENTRIES.map(([region]) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: "1 1 220px", minWidth: "200px" }}>
                <span
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  使用するリードタイム
                </span>
                <div
                  style={{ display: "flex", gap: "12px", alignItems: "center" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <input
                      type="radio"
                      name="leadtime-mode"
                      value="min"
                      checked={autoFillMode === "min"}
                      onChange={() => setAutoFillMode("min")}
                    />
                    最短日数
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <input
                      type="radio"
                      name="leadtime-mode"
                      value="max"
                      checked={autoFillMode === "max"}
                      onChange={() => setAutoFillMode("max")}
                    />
                    最大日数
                  </label>
                </div>
              </div>

              <s-button onClick={applyFactoryLeadTime} variant="secondary">
                出荷元のリードタイムを適用
              </s-button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "32px",
                marginTop: "16px",
              }}
            >
              <div
                style={{
                  flex: "1 1 420px",
                  minWidth: "320px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {REGION_ENTRIES.map(([region, prefectures]) => {
                  const inputValue = regionValueMap[region];
                  return (
                    <div
                      key={region}
                      style={{
                        border: "1px solid #e1e3e5",
                        borderRadius: "12px",
                        padding: "12px",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "6px",
                          alignSelf: "stretch",
                          borderRadius: "999px",
                          background: REGION_COLORS[region],
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{region}</span>
                          <span style={{ fontSize: "12px", color: "#6c7179" }}>
                            {prefectures.length}都道府県
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6c7179",
                            marginTop: "4px",
                            lineHeight: 1.4,
                          }}
                        >
                          {prefectures.join(" / ")}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <input
                          ref={(el) => {
                            regionInputRefs.current[region] = el;
                          }}
                          type="number"
                          value={inputValue === "" ? "" : String(inputValue ?? "")}
                          onChange={(e) =>
                            handleRegionChange(region, e.target.value)
                          }
                          min="0"
                          max="10"
                          placeholder="日数"
                          style={{
                            padding: "6px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            width: "82px",
                            textAlign: "right",
                          }}
                        />
                        <span>日</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ flex: "1 1 360px", minWidth: "320px" }}>
                <div style={{ fontWeight: 600, marginBottom: "12px" }}>
                  全国地図から設定
                </div>
                <div
                  style={{
                    border: "1px solid #e1e3e5",
                    borderRadius: "16px",
                    padding: "16px",
                    background: "#f8fbff",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "6 / 5",
                      minHeight: "360px",
                    }}
                  >
                    <RegionMap
                      regionValues={regionValueMap}
                      onSelect={focusRegionInput}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: "12px",
                      fontSize: "12px",
                      color: "#6c7179",
                      textAlign: "center",
                    }}
                  >
                    ※ 色の濃淡は入力済みかどうかを表します
                  </div>
                </div>
              </div>
            </div>

            <s-button
              onClick={handleSaveRegions}
              {...(isLoading ? { loading: true } : {})}
            >
              保存
            </s-button>
          </s-stack>
        </AccordionSection>

        {/* 休業日設定 */}
        <AccordionSection
          id="holidays"
          title="休業日設定"
          isOpen={openSections.has("holidays")}
          isLast={true}
          onToggle={() => toggleSection("holidays")}
        >
          <s-stack direction="block" gap="large">
            {/* 定期休業日 */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                定期休業日
              </h3>
              <s-stack direction="block" gap="base">
                <s-paragraph>毎週の定休日を設定してください。</s-paragraph>

                <s-stack direction="block" gap="small">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={saturday}
                      onChange={(e) => setSaturday(e.target.checked)}
                    />
                    <span>土曜日</span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sunday}
                      onChange={(e) => setSunday(e.target.checked)}
                    />
                    <span>日曜日</span>
                  </label>
                </s-stack>

                <s-button onClick={handleSaveWeeklyHolidays}>
                  定期休業日を保存
                </s-button>
              </s-stack>
            </div>

            {/* 祝日 */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>祝日</h3>
              <s-stack direction="block" gap="base">
                <s-paragraph>
                  日本の祝日を一括で登録できます。配送予定日の計算時に自動でスキップされます。
                </s-paragraph>

                <s-button
                  onClick={handleImportJapaneseHolidays}
                  variant="secondary"
                >
                  2025年の祝日を一括登録
                </s-button>
              </s-stack>
            </div>

            {/* カスタム休業日 */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
                カスタム休業日
              </h3>
              <s-stack direction="block" gap="base">
                <s-paragraph>
                  夏季休業や臨時休業など、特定の日を休業日として追加できます。
                </s-paragraph>

                <s-stack direction="inline" gap="base">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    style={{
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="理由（例: 夏季休業）"
                    style={{
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      minWidth: "200px",
                    }}
                  />
                  <s-button onClick={handleAddCustomHoliday}>追加</s-button>
                </s-stack>

                {customHolidays.length > 0 && (
                  <div style={{ marginTop: "16px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            日付
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            理由
                          </th>
                          <th style={{ padding: "8px", textAlign: "center" }}>
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {customHolidays.map((holiday) => (
                          <tr
                            key={holiday.id}
                            style={{ borderTop: "1px solid #ddd" }}
                          >
                            <td style={{ padding: "8px" }}>
                              {new Date(holiday.date).toLocaleDateString(
                                "ja-JP"
                              )}
                            </td>
                            <td style={{ padding: "8px" }}>{holiday.reason}</td>
                            <td style={{ padding: "8px", textAlign: "center" }}>
                              <s-button
                                onClick={() => handleDeleteHoliday(holiday.id)}
                                variant="tertiary"
                              >
                                削除
                              </s-button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </s-stack>
            </div>
          </s-stack>
        </AccordionSection>
      </div>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
