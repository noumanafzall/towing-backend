/*
  Warnings:

  - You are about to drop the column `city` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `DriverProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CustomerProfile" DROP COLUMN "city";

-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "city",
DROP COLUMN "country";
