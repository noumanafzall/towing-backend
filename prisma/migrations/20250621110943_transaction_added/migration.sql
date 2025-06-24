/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `PricingSetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "city" TEXT,
ADD COLUMN     "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalAmountSpent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalOrders" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN     "city" TEXT;

-- AlterTable
ALTER TABLE "DriverTaxProfile" ADD COLUMN     "consent1099" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "mailingAddress" TEXT,
ADD COLUMN     "ssnOrEin" TEXT;

-- AlterTable
ALTER TABLE "PricingSetting" DROP COLUMN "updatedAt";
