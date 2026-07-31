import "server-only";

import { randomUUID } from "node:crypto";
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { z } from "zod";
import type { mediaRequestSchema } from "@/lib/schemas/admin";
import type { AdminPrincipal } from "./admin-auth";
import { auditAdminMutation } from "./admin-auth";
import { getDatabase } from "./db";
import { AppError, ConfigurationError } from "./errors";

type MediaInput = z.infer<typeof mediaRequestSchema>;

function config() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new ConfigurationError("Cloudflare R2 no está configurado.");
  }
  return { endpoint, accessKeyId, secretAccessKey, bucket, publicUrl: new URL(publicUrl) };
}

function clientFor(cfg: ReturnType<typeof config>) {
  return new S3Client({
    region: "auto",
    endpoint: cfg.endpoint,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
}

export async function handleMedia(
  principal: AdminPrincipal,
  input: MediaInput,
) {
  const database = getDatabase();
  if (!database) throw new ConfigurationError("PostgreSQL es obligatorio.");
  const product = await database.product.findUnique({ where: { id: input.productId }, select: { id: true } });
  if (!product) throw new AppError(404, "product_not_found", "Producto no encontrado.");
  const cfg = config();

  if (input.action === "presign") {
    const extension = input.contentType === "image/png" ? "png" : input.contentType === "image/webp" ? "webp" : "jpg";
    const key = `products/${input.productId}/${randomUUID()}.${extension}`;
    const client = clientFor(cfg);
    const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.size,
    }), { expiresIn: 300 });
    return { uploadUrl, key, publicUrl: new URL(key, cfg.publicUrl.href.endsWith("/") ? cfg.publicUrl : `${cfg.publicUrl.href}/`).href };
  }

  if (!input.key.startsWith(`products/${input.productId}/`)) {
    throw new AppError(422, "invalid_media_key", "Clave de medio inválida.");
  }
  const expected = new URL(input.key, cfg.publicUrl.href.endsWith("/") ? cfg.publicUrl : `${cfg.publicUrl.href}/`);
  if (new URL(input.url).href !== expected.href) {
    throw new AppError(422, "invalid_media_url", "URL pública inválida.");
  }
  const uploaded = await clientFor(cfg).send(new HeadObjectCommand({
    Bucket: cfg.bucket,
    Key: input.key,
  }));
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(uploaded.ContentType ?? "") ||
    !uploaded.ContentLength ||
    uploaded.ContentLength > 8 * 1024 * 1024
  ) {
    throw new AppError(422, "invalid_uploaded_media", "El archivo cargado no cumple la política.");
  }
  const media = await database.productMedia.create({
    data: { productId: input.productId, url: expected.href, altText: input.altText, provisional: false },
    select: { id: true, url: true, altText: true, productId: true },
  });
  await auditAdminMutation(principal, "product-media.create", "ProductMedia", media.id);
  return media;
}
