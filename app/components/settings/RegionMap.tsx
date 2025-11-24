import {
  REGION_COLORS,
  REGION_SVG_PATHS,
  type RegionName,
} from "../../lib/constants";

type RegionMapProps = {
  regionValues: Record<RegionName, number | "">;
  onSelect(region: RegionName): void;
};

const REGION_PATHS = Object.entries(REGION_SVG_PATHS) as [
  RegionName,
  string,
][];

const OKINAWA_SEPARATOR_PATH = "M200 90 L200 230 L110 230";

export function RegionMap({ regionValues, onSelect }: RegionMapProps) {
  return (
    <svg
      viewBox="0 0 600 500"
      role="img"
      aria-label="地域別配送日数設定用の日本地図"
      style={{ width: "100%", height: "100%" }}
    >
      <desc>地図をクリックすると該当する地域の入力欄にフォーカスします。</desc>
      <defs>
        <linearGradient
          id="mapBgGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0%" stopColor="#f9fbff" />
          <stop offset="100%" stopColor="#eef3ff" />
        </linearGradient>
        <filter id="regionShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="6"
            floodColor="rgba(0, 0, 0, 0.2)"
          />
        </filter>
      </defs>
      <rect x="0" y="0" width="600" height="500" rx="24" fill="url(#mapBgGradient)" />
      <path
        d={OKINAWA_SEPARATOR_PATH}
        fill="none"
        stroke="#cfd8e3"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {REGION_PATHS.map(([region, path]) => {
        const value = regionValues[region];
        const isSet = value !== "";
        const label = isSet
          ? `${region} ${value}日`
          : `${region} 未入力（クリックで入力欄へ移動）`;
        return (
          <path
            key={region}
            d={path}
            tabIndex={0}
            role="button"
            aria-label={label}
            onClick={() => onSelect(region)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(region);
              }
            }}
            fill={REGION_COLORS[region]}
            stroke="#f6f8fb"
            strokeWidth={6}
            filter="url(#regionShadow)"
            opacity={isSet ? 1 : 0.7}
            style={{
              cursor: "pointer",
              transition: "transform 0.15s ease, opacity 0.2s ease",
            }}
            onMouseEnter={(event) => {
              (event.currentTarget as SVGPathElement).style.transform =
                "scale(1.02)";
            }}
            onMouseLeave={(event) => {
              (event.currentTarget as SVGPathElement).style.transform =
                "scale(1)";
            }}
          >
            <title>{label}</title>
          </path>
        );
      })}
    </svg>
  );
}
