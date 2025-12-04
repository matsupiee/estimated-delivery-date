import { authenticate } from "app/servers/shopify.server";
import type { ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  // 認証を行う
  await authenticate.webhook(request);

  // 認証が成功したら空のレスポンスを返す
  return new Response();
};
