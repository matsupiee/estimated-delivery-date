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
import { prisma } from "app/servers/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // 既存の設定を取得
  const config = await prisma.shippingConfig.findUnique({
    where: { shop },
  });

  return {
    preparationDays: config?.preparationDays ?? 1,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  const formData = await request.formData();
  const preparationDays = parseInt(
    formData.get("preparationDays") as string,
    10
  );

  // 設定を保存（upsert）
  await prisma.shippingConfig.upsert({
    where: { shop },
    create: {
      shop,
      preparationDays,
    },
    update: {
      preparationDays,
    },
  });

  return { success: true };
};

export default function Settings() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [preparationDays, setPreparationDays] = useState(
    loaderData.preparationDays
  );

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show("設定を保存しました");
    }
  }, [fetcher.data?.success, shopify]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("preparationDays", preparationDays.toString());
    fetcher.submit(formData, { method: "POST" });
  };

  return (
    <s-page heading="配送設定">
      <s-button slot="primary-action" onClick={handleSave}>
        保存
      </s-button>

      <s-section heading="基本設定">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            注文を受けてから発送までにかかる営業日数を設定してください。
          </s-paragraph>

          <s-stack direction="inline" gap="base">
            <s-text>発送準備日数:</s-text>
            <input
              type="number"
              value={preparationDays}
              onChange={(e) => setPreparationDays(parseInt(e.target.value, 10))}
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
