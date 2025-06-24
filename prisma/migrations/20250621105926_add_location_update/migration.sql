/*
  Warnings:

  - A unique constraint covering the columns `[lastLocationId]` on the table `Ride` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CustomerProfile" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "lastLocationId" INTEGER;

-- CreateTable
CREATE TABLE "LocationUpdate" (
    "id" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "isLastKnown" BOOLEAN NOT NULL DEFAULT false,
    "lastLocationForRideId" INTEGER,

    CONSTRAINT "LocationUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LocationUpdate_lastLocationForRideId_key" ON "LocationUpdate"("lastLocationForRideId");

-- CreateIndex
CREATE UNIQUE INDEX "Ride_lastLocationId_key" ON "Ride"("lastLocationId");

-- AddForeignKey
ALTER TABLE "LocationUpdate" ADD CONSTRAINT "LocationUpdate_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_lastLocationId_fkey" FOREIGN KEY ("lastLocationId") REFERENCES "LocationUpdate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
