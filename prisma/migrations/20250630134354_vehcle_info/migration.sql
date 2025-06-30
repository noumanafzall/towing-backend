/*
  Warnings:

  - You are about to drop the column `vehicleId` on the `Ride` table. All the data in the column will be lost.
  - You are about to drop the `CustomerVehicle` table. If the table is not empty, all the data it contains will be lost.
*/

-- First, add the new columns with default values
ALTER TABLE "Ride" 
ADD COLUMN "plateNumber" TEXT DEFAULT 'UNKNOWN',
ADD COLUMN "vehicleColor" TEXT DEFAULT 'UNKNOWN',
ADD COLUMN "vehicleModel" TEXT DEFAULT 'UNKNOWN',
ADD COLUMN "vehicleType" TEXT DEFAULT 'UNKNOWN',
ADD COLUMN "afterRidePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "beforeRidePhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Copy data from CustomerVehicle to Ride if possible
UPDATE "Ride" r
SET 
    "plateNumber" = cv."plateNumber",
    "vehicleColor" = cv."color",
    "vehicleType" = cv."vehicleType",
    "vehicleModel" = 'UNKNOWN',
    "beforeRidePhotos" = cv."beforeRidePhotos",
    "afterRidePhotos" = cv."afterRidePhotos"
FROM "CustomerVehicle" cv
WHERE r."vehicleId" = cv.id;

-- DropForeignKey
ALTER TABLE "CustomerVehicle" DROP CONSTRAINT "CustomerVehicle_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Ride" DROP CONSTRAINT "Ride_vehicleId_fkey";

-- Now make the columns required (remove default values)
ALTER TABLE "Ride" 
ALTER COLUMN "plateNumber" DROP DEFAULT,
ALTER COLUMN "vehicleColor" DROP DEFAULT,
ALTER COLUMN "vehicleModel" DROP DEFAULT,
ALTER COLUMN "vehicleType" DROP DEFAULT;

-- Drop the vehicleId column
ALTER TABLE "Ride" DROP COLUMN "vehicleId";

-- Finally drop the CustomerVehicle table
DROP TABLE "CustomerVehicle";
