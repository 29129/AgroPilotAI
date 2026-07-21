CREATE TYPE "MarketSource" AS ENUM ('MAG_SIPA', 'INEC');
CREATE TABLE "MarketImport" ("id" UUID NOT NULL, "source" "MarketSource" NOT NULL, "sourceUrl" TEXT NOT NULL, "checksum" TEXT NOT NULL, "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "MarketImport_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "MarketImport_source_checksum_key" ON "MarketImport"("source", "checksum");
CREATE TABLE "MarketPrice" ("id" UUID NOT NULL, "importId" UUID NOT NULL, "product" TEXT NOT NULL, "province" TEXT, "unit" TEXT NOT NULL, "currency" TEXT NOT NULL DEFAULT 'USD', "price" DECIMAL(12,4) NOT NULL, "observedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "MarketPrice_pkey" PRIMARY KEY ("id"));
CREATE INDEX "MarketPrice_product_province_observedAt_idx" ON "MarketPrice"("product", "province", "observedAt");
ALTER TABLE "MarketPrice" ADD CONSTRAINT "MarketPrice_importId_fkey" FOREIGN KEY ("importId") REFERENCES "MarketImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
