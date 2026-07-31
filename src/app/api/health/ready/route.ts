import { databaseReadiness } from "@/lib/server/db";
import {
  errorResponse,
  jsonResponse,
} from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const readiness = await databaseReadiness();
    return jsonResponse(
      { status: readiness.ready ? "ready" : "not_ready", mode: readiness.mode },
      { status: readiness.ready ? 200 : 503 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
