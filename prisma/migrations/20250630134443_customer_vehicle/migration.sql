/*
  Warnings:

  - Made the column `plateNumber` on table `Ride` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vehicleColor` on table `Ride` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vehicleModel` on table `Ride` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vehicleType` on table `Ride` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Ride" ALTER COLUMN "plateNumber" SET NOT NULL,
ALTER COLUMN "vehicleColor" SET NOT NULL,
ALTER COLUMN "vehicleModel" SET NOT NULL,
ALTER COLUMN "vehicleType" SET NOT NULL,
ALTER COLUMN "afterRidePhotos" DROP DEFAULT,
ALTER COLUMN "beforeRidePhotos" DROP DEFAULT;
