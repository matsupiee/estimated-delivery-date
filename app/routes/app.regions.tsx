import { useEffect, useRef, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../servers/shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {
  PREFECTURES,
  REGIONS,
  REGION_COLORS,
  REGION_GRID_PLACEMENT,
  type RegionName,
} from "../lib/constants";
import { prisma } from "app/servers/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // 既存の地域別設定を取得
  const regionalTimes = await prisma.regionalShippingTime.findMany({
    where: { shop },
  });

  // 都道府県ごとのマップを作成
  const regionalMap: Record<string, number> = {};
  regionalTimes.forEach((rt) => {
    regionalMap[rt.prefecture] = rt.shippingDays;
  });

  return { regionalMap };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const regionalDataJson = formData.get("regionalData") as string;
  const regionalData: Record<string, number> = JSON.parse(regionalDataJson);

  // 一括でupsert
  await Promise.all(
    Object.entries(regionalData).map(([prefecture, shippingDays]) =>
      prisma.regionalShippingTime.upsert({
        where: {
          shop_prefecture: {
            shop,
            prefecture,
          },
        },
        create: {
          shop,
          prefecture,
          shippingDays,
        },
        update: {
          shippingDays,
        },
      })
    )
  );

  return { success: true };
};

export default function Regions() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [regionalMap, setRegionalMap] = useState<Record<string, number>>(
    loaderData.regionalMap
  );
  const regionInputRefs = useRef<Record<RegionName, HTMLInputElement | null>>(
    Object.keys(REGIONS).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {} as Record<RegionName, HTMLInputElement | null>
    )
  );

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("地域別配送日数を保存しました");
    }
  }, [fetcher.data?.success, shopify]);

  const handleSave = () => {
    const formData = new FormData();
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
    if (values.length === 0) {
      return "";
    }
    const first = values[0];
    return values.every((value) => value === first) ? first : "";
  };

  // デフォルト値を一括設定
  const setDefaultValues = () => {
    const defaultMap: Record<string, number> = {};
    PREFECTURES.forEach((pref) => {
      // 北海道・沖縄は3日、それ以外は1日
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

  const regionEntries = Object.entries(REGIONS) as [
    RegionName,
    readonly string[]
  ][];

  return (
    <s-page heading="地域別配送日数">
      <s-button slot="primary-action" onClick={handleSave}>
        保存
      </s-button>

      <s-section heading="配送日数の設定">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            地域単位で配送日数を入力すると、地図にも同じ色で反映されます。地図をクリックすると該当地域の入力にフォーカスします。
          </s-paragraph>

          <s-button onClick={setDefaultValues} variant="secondary">
            デフォルト値を設定（北海道・沖縄: 3日、その他: 1日）
          </s-button>

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
              {regionEntries.map(([region, prefectures]) => {
                const inputValue = getRegionInputValue(region);
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
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#6c7179",
                          }}
                        >
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
                        value={inputValue === "" ? "" : String(inputValue)}
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

            <div
              style={{
                flex: "1 1 360px",
                minWidth: "320px",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "12px" }}>
                全国地図から設定
              </div>
              <div
                style={{
                  border: "1px solid #e1e3e5",
                  borderRadius: "16px",
                  padding: "20px",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.9), rgba(246,249,255,0.9))",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                    gridAutoRows: "32px",
                    gap: "6px",
                    height: "420px",
                  }}
                >
                  {regionEntries.map(([region]) => {
                    const placement = REGION_GRID_PLACEMENT[region];
                    const inputValue = getRegionInputValue(region);
                    const hasValue = inputValue !== "";
                    return (
                      <button
                        key={region}
                        type="button"
                        onClick={() => focusRegionInput(region)}
                        style={{
                          gridColumn: `${placement.columnStart} / ${placement.columnEnd}`,
                          gridRow: `${placement.rowStart} / ${placement.rowEnd}`,
                          border: "none",
                          borderRadius: "10px",
                          background: REGION_COLORS[region],
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: "14px",
                          boxShadow:
                            "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)",
                          cursor: "pointer",
                          opacity: hasValue ? 1 : 0.65,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                          transition: "transform 0.15s ease, opacity 0.2s ease",
                        }}
                        aria-label={`${region}の配送日数入力に移動`}
                      >
                        {region}
                      </button>
                    );
                  })}
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
            onClick={handleSave}
            {...(isLoading ? { loading: true } : {})}
          >
            保存
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
