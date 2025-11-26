import { createTimeoutSignal } from "app/lib/create-timeout-signal";
import { mapRegionCodeToPrefecture } from "./map-region-code-to-prefecture.server";
import { Prefecture } from "app/lib/constants";

export async function fetchFromIpApi(ip: string): Promise<Prefecture | null> {
  const apiUrl = `https://ipapi.co/${ip}/json/`;
  const { signal, clear } = createTimeoutSignal(3000);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "shopify-estimated-delivery-date/1.0",
      },
      signal,
    });

    if (response.status === 429) {
      console.warn("IP geolocation API rate limit (ipapi.co)");
      return null;
    }

    if (!response.ok) {
      console.error("IP geolocation API error:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.country_code !== "JP") {
      return null;
    }

    return mapRegionCodeToPrefecture(data.region_code, data.region);
  } catch (error) {
    console.error("IP geolocation fetch failed (ipapi.co):", error);
    return null;
  } finally {
    clear();
  }
}
