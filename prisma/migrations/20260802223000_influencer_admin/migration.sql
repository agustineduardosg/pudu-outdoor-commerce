CREATE TYPE "InfluencerStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "InfluencerMediaKind" AS ENUM ('PORTRAIT', 'LIFESTYLE', 'CAMPAIGN', 'PRODUCT');

CREATE TABLE "Influencer" (
  "id" UUID NOT NULL,
  "slug" VARCHAR(120) NOT NULL,
  "displayName" VARCHAR(120) NOT NULL,
  "legalName" VARCHAR(160),
  "pronouns" VARCHAR(40),
  "bio" TEXT NOT NULL,
  "location" VARCHAR(160),
  "email" VARCHAR(254),
  "instagramHandle" VARCHAR(80),
  "status" "InfluencerStatus" NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InfluencerMedia" (
  "id" UUID NOT NULL,
  "url" VARCHAR(2048) NOT NULL,
  "altText" VARCHAR(240) NOT NULL,
  "caption" VARCHAR(300),
  "kind" "InfluencerMediaKind" NOT NULL DEFAULT 'PORTRAIT',
  "provisional" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "influencerId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InfluencerMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Influencer_slug_key" ON "Influencer"("slug");
CREATE INDEX "Influencer_status_featured_sortOrder_idx" ON "Influencer"("status", "featured", "sortOrder");
CREATE INDEX "InfluencerMedia_influencerId_sortOrder_idx" ON "InfluencerMedia"("influencerId", "sortOrder");

ALTER TABLE "InfluencerMedia"
  ADD CONSTRAINT "InfluencerMedia_influencerId_fkey"
  FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Influencer" (
  "id", "slug", "displayName", "bio", "location", "status", "featured", "sortOrder", "createdAt", "updatedAt"
) VALUES (
  '8dc0ca73-944e-45e0-8d43-3744ff8fd0f5',
  'maite',
  'Maite',
  'Primera embajadora oficial de PUDU. Su archivo editorial presenta las prendas conceptuales en escenarios de cordillera y refugio.',
  'Chile',
  'ACTIVE',
  true,
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

INSERT INTO "InfluencerMedia" (
  "id", "url", "altText", "caption", "kind", "provisional", "sortOrder", "influencerId", "createdAt"
) VALUES
  (
    'c8aeffae-c75c-44a8-a86e-02e213912a48',
    '/images/maite/maite-retrato-refugio.webp',
    'Retrato editorial de Maite en un refugio de montaña',
    'Retrato de perfil para el archivo de embajadores.',
    'PORTRAIT', true, 0, '8dc0ca73-944e-45e0-8d43-3744ff8fd0f5', CURRENT_TIMESTAMP
  ),
  (
    'd75779c4-2bc2-4992-9526-23f25627593f',
    '/images/maite/maite-softshell-austral-snow.avif',
    'Maite viste el softshell PUDU en un paisaje nevado',
    'Campaña conceptual Softshell Austral.',
    'CAMPAIGN', true, 1, '8dc0ca73-944e-45e0-8d43-3744ff8fd0f5', CURRENT_TIMESTAMP
  ),
  (
    '3eeea7ae-c119-44aa-a1cc-b546d5a2e64d',
    '/images/maite/maite-polar-lenga-refugio.avif',
    'Maite viste el polar PUDU al interior de un refugio',
    'Campaña conceptual Polar Lenga.',
    'LIFESTYLE', true, 2, '8dc0ca73-944e-45e0-8d43-3744ff8fd0f5', CURRENT_TIMESTAMP
  );
