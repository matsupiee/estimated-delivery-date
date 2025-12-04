import type { ActionFunctionArgs } from "react-router";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Received webhook request");
  console.log("Method:", request.method);
  console.log("URL:", request.url);

  // Shopify審査用：とりあえず200を返す
  return new Response(null, { status: 200 });
};
