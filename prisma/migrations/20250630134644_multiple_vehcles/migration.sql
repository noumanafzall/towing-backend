/*
  Warnings:

  - You are about to drop the column `afterRidePhotos` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `beforeRidePhotos` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `plateNumber` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleColor` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleModel` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleType` on the `Ride` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ride" DROP COLUMN "afterRidePhotos",
DROP COLUMN "beforeRidePhotos",
DROP COLUMN "plateNumber",
DROP COLUMN "vehicleColor",
DROP COLUMN "vehicleModel",
DROP COLUMN "vehicleType";

-- CreateTable
CREATE TABLE "RideVehicle" (
    "id" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "vehicleColor" TEXT NOT NULL,
    "beforeRidePhotos" TEXT[],
    "afterRidePhotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RideVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RideVehicle_rideId_idx" ON "RideVehicle"("rideId");

-- AddForeignKey
ALTER TABLE "RideVehicle" ADD CONSTRAINT "RideVehicle_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
