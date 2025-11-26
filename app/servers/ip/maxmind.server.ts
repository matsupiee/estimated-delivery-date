import { Prefecture } from "app/lib/constants";
import { join } from "path";
import { cwd } from "process";
import maxmind, { CityResponse } from "maxmind";
import { mapRegionCodeToPrefecture } from "./map-region-code-to-prefecture.server";

const MAXMIND_DB_PATH = join(cwd(), "geoip", "GeoLite2-City.mmdb");

export async function lookupPrefectureFromMaxmind(
  ip: string,
): Promise<Prefecture | null> {
  const lookup = await maxmind.open<CityResponse>(MAXMIND_DB_PATH);

  try {
    const record = lookup.get(ip);

    if (!record || record.country?.iso_code !== "JP") {
      return null;
    }

    const subdivision = record.subdivisions?.[0];
    const regionCode = subdivision?.iso_code?.replace("JP-", "");
    const regionName = subdivision?.names?.ja || subdivision?.names?.en;

    return mapRegionCodeToPrefecture(regionCode, regionName);
  } catch (error) {
    console.error("MaxMind lookup failed:", error);
    return null;
  }
}
