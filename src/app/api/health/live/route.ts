import { jsonResponse } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return jsonResponse({
    status: "ok",
    service: "pudu-web",
    time: new Date().toISOString(),
  });
}
