import { useEffect, useState } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../servers/shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { PREFECTURES, REGIONS, type RegionName } from "../lib/constants";
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

  return (
    <s-page heading="地域別配送日数">
      <s-button slot="primary-action" onClick={handleSave}>
        保存
      </s-button>

      <s-section heading="配送日数の設定">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            地域単位で配送にかかる日数を入力すると、地域に含まれる全ての都道府県へ反映されます。
          </s-paragraph>

          <s-button onClick={setDefaultValues} variant="secondary">
            デフォルト値を設定（北海道・沖縄: 3日、その他: 1日）
          </s-button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {(Object.entries(REGIONS) as [RegionName, readonly string[]][])
              .map(([region, prefectures]) => {
                const inputValue = getRegionInputValue(region);
                return (
                  <div
                    key={region}
                    style={{
                      border: "1px solid #e1e3e5",
                      borderRadius: "8px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{region}</div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6c7179",
                            marginTop: "4px",
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
                          type="number"
                          value={inputValue === "" ? "" : String(inputValue)}
                          onChange={(e) => handleRegionChange(region, e.target.value)}
                          min="0"
                          max="10"
                          placeholder="日数"
                          style={{
                            padding: "6px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            width: "80px",
                            textAlign: "right",
                          }}
                        />
                        <span>日</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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
