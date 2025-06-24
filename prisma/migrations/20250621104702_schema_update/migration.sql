/*
  Warnings:

  - You are about to drop the column `city` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `termsAccepted` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmountSpent` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `totalOrders` on the `CustomerProfile` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the column `consent1099` on the `DriverTaxProfile` table. All the data in the column will be lost.
  - You are about to drop the column `driverProfileId` on the `DriverTaxProfile` table. All the data in the column will be lost.
  - You are about to drop the column `legalName` on the `DriverTaxProfile` table. All the data in the column will be lost.
  - You are about to drop the column `mailingAddress` on the `DriverTaxProfile` table. All the data in the column will be lost.
  - You are about to drop the column `ssnOrEin` on the `DriverTaxProfile` table. All the data in the column will be lost.
  - You are about to drop the column `distance` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `Ride` table. All the data in the column will be lost.
  - You are about to alter the column `basePrice` on the `Ride` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `rideId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `isActive` on the `Wallet` table. All the data in the column will be lost.
  - You are about to alter the column `balance` on the `Wallet` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the `LocationUpdate` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[driverId]` on the table `DriverTaxProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `CustomerProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driverId` to the `DriverTaxProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `dropoffLocation` on table `Ride` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `method` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `walletId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WALLET', 'CARD', 'BANK');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'LIMITED_ADMIN';

-- DropForeignKey
ALTER TABLE "DriverTaxProfile" DROP CONSTRAINT "DriverTaxProfile_driverProfileId_fkey";

-- DropForeignKey
ALTER TABLE "LocationUpdate" DROP CONSTRAINT "LocationUpdate_lastLocationForRideId_fkey";

-- DropForeignKey
ALTER TABLE "LocationUpdate" DROP CONSTRAINT "LocationUpdate_rideId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_rideId_fkey";

-- DropIndex
DROP INDEX "DriverTaxProfile_driverProfileId_key";

-- DropIndex
DROP INDEX "Transaction_rideId_key";

-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN "defaultAddress" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "city",
DROP COLUMN "termsAccepted",
DROP COLUMN "totalAmountSpent",
DROP COLUMN "totalOrders";

-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "city",
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "iban" TEXT,
ADD COLUMN     "swiftCode" TEXT;

-- AlterTable
ALTER TABLE "DriverTaxProfile" DROP COLUMN "consent1099",
DROP COLUMN "driverProfileId",
DROP COLUMN "legalName",
DROP COLUMN "mailingAddress",
DROP COLUMN "ssnOrEin",
ADD COLUMN     "driverId" INTEGER NOT NULL,
ADD COLUMN     "taxCountry" TEXT,
ADD COLUMN     "taxDocumentUrl" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "taxRate" DOUBLE PRECISION,
ADD COLUMN     "taxRegion" TEXT;

-- AlterTable
ALTER TABLE "Ride" DROP COLUMN "distance",
DROP COLUMN "totalCost",
ADD COLUMN     "actualDistance" DOUBLE PRECISION,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "estimatedDistance" DOUBLE PRECISION,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "totalPrice" DOUBLE PRECISION,
ALTER COLUMN "dropoffLocation" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "basePrice" DROP DEFAULT,
ALTER COLUMN "basePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "extraMiles" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "rideId",
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "method" "PaymentMethod" NOT NULL,
ADD COLUMN     "walletId" INTEGER NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "region" TEXT,
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "isActive",
ALTER COLUMN "balance" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "LocationUpdate";

-- CreateTable
CREATE TABLE "CustomerVehicle" (
    "id" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "photos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "routingNumber" TEXT,
    "iban" TEXT,
    "swiftCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "evidencePhotos" TEXT[],
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" INTEGER,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefundLog" (
    "id" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefundLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingSetting" (
    "id" SERIAL NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL DEFAULT 50.00,
    "baseMiles" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "pricePerMile" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerVehicle_rideId_key" ON "CustomerVehicle"("rideId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_userId_key" ON "BankAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverTaxProfile_driverId_key" ON "DriverTaxProfile"("driverId");

-- AddForeignKey
ALTER TABLE "DriverTaxProfile" ADD CONSTRAINT "DriverTaxProfile_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "DriverProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerVehicle" ADD CONSTRAINT "CustomerVehicle_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundLog" ADD CONSTRAINT "RefundLog_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundLog" ADD CONSTRAINT "RefundLog_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefundLog" ADD CONSTRAINT "RefundLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
