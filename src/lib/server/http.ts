import "server-only";

import type { ZodType } from "zod";

import { AppError } from "./errors";

const PROBLEM_CONTENT_TYPE = "application/problem+json; charset=utf-8";

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
  maxBytes = 32_768,
): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new AppError(
      415,
      "unsupported_media_type",
      "El cuerpo debe usar application/json.",
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new AppError(413, "payload_too_large", "El cuerpo excede el límite.");
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    throw new AppError(413, "payload_too_large", "El cuerpo excede el límite.");
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new AppError(400, "invalid_json", "El JSON no es válido.");
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(422, "validation_error", "Datos inválidos.", {
      invalidParams: result.error.issues.slice(0, 12).map((issue) => ({
        name: issue.path.join("."),
        reason: issue.message,
      })),
    });
  }
  return result.data;
}

export function jsonResponse(
  data: unknown,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  headers.set("x-content-type-options", "nosniff");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function problemResponse(
  status: number,
  code: string,
  title: string,
  details?: unknown,
): Response {
  return new Response(
    JSON.stringify({
      type: `https://pudu.cl/problems/${code}`,
      title,
      status,
      code,
      ...(details && typeof details === "object" ? details : {}),
    }),
    {
      status,
      headers: {
        "content-type": PROBLEM_CONTENT_TYPE,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return problemResponse(error.status, error.code, error.message, error.details);
  }

  return problemResponse(
    500,
    "internal_error",
    "No fue posible completar la solicitud.",
  );
}
