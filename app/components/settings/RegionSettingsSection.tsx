import { useMemo, useRef, useState } from "react";
import {
  PREFECTURES,
  REGIONS,
  REGION_COLORS,
  REGION_LEAD_TIME,
  PREFECTURE_TO_REGION,
  type RegionName,
} from "../../lib/constants";
import { RegionMap } from "./RegionMap";

const REGION_ENTRIES = Object.entries(REGIONS) as [
  RegionName,
  readonly string[]
][];

type RegionSettingsSectionProps = {
  regionalMap: Record<string, number>;
  onRegionalMapChange: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  onSave: () => void;
  isLoading: boolean;
};

const getRegionInputValue = (regionalMap: Record<string, number>, region: RegionName) => {
  const values = REGIONS[region]
    .map((prefecture) => regionalMap[prefecture])
    .filter((value): value is number => typeof value === "number");
  if (values.length === 0) return "";
  const first = values[0];
  return values.every((value) => value === first) ? first : "";
};

export function RegionSettingsSection({
  regionalMap,
  onRegionalMapChange,
  onSave,
  isLoading,
}: RegionSettingsSectionProps) {
  const regionInputRefs = useRef<Record<RegionName, HTMLInputElement | null>>(
    Object.keys(REGIONS).reduce(
      (acc, key) => ({ ...acc, [key]: null }),
      {} as Record<RegionName, HTMLInputElement | null>
    )
  );

  const [factoryRegion, setFactoryRegion] = useState<RegionName>("関東");
  const [autoFillMode, setAutoFillMode] = useState<"min" | "max">("max");

  const handleRegionChange = (region: RegionName, value: string) => {
    const parsed = parseInt(value, 10);
    const days = Number.isNaN(parsed) ? 0 : parsed;
    onRegionalMapChange((prev) => {
      const next = { ...prev };
      REGIONS[region].forEach((prefecture) => {
        next[prefecture] = days;
      });
      return next;
    });
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
    onRegionalMapChange(() => defaultMap);
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
    onRegionalMapChange((prev) => {
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
        acc[region] = getRegionInputValue(regionalMap, region);
        return acc;
      }, {} as Record<RegionName, number | "">),
    [regionalMap]
  );

  return (
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
            onChange={(e) => setFactoryRegion(e.target.value as RegionName)}
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
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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
                    onChange={(e) => handleRegionChange(region, e.target.value)}
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

      <s-button onClick={onSave} {...(isLoading ? { loading: true } : {})}>
        保存
      </s-button>
    </s-stack>
  );
}
