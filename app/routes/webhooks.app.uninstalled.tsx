import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../servers/shopify.server";
import { prisma } from "app/servers/db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Received app/uninstalled webhook");
  
  const { shop, session, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await prisma.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
