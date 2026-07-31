import { z } from "zod";

import { paginationSchema, slugSchema } from "./common";

export const productListQuerySchema = paginationSchema.extend({
  collection: slugSchema.optional(),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const productSlugSchema = slugSchema;
