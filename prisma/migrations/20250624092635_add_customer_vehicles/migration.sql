/*
  Warnings:

  - You are about to drop the column `rideId` on the `CustomerVehicle` table. All the data in the column will be lost.
  - Added the required column `customerId` to the `CustomerVehicle` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the new columns to CustomerVehicle
ALTER TABLE "CustomerVehicle" ADD COLUMN "beforeRidePhotos" TEXT[] DEFAULT '{}';
ALTER TABLE "CustomerVehicle" ADD COLUMN "afterRidePhotos" TEXT[] DEFAULT '{}';
ALTER TABLE "CustomerVehicle" ADD COLUMN "isDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CustomerVehicle" ADD COLUMN "customerId" INTEGER;

-- Add vehicleId to Ride table
ALTER TABLE "Ride" ADD COLUMN "vehicleId" INTEGER;

-- Update customerId in CustomerVehicle based on existing rides
UPDATE "CustomerVehicle" 
SET "customerId" = (
  SELECT "customerId" 
  FROM "Ride" 
  WHERE "Ride".id = "CustomerVehicle"."rideId"
);

-- Make customerId NOT NULL after setting values
ALTER TABLE "CustomerVehicle" ALTER COLUMN "customerId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "CustomerVehicle" ADD CONSTRAINT "CustomerVehicle_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "CustomerVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update vehicleId in Ride based on existing CustomerVehicle
UPDATE "Ride" 
SET "vehicleId" = (
  SELECT id 
  FROM "CustomerVehicle" 
  WHERE "CustomerVehicle"."rideId" = "Ride".id
);

-- Drop the old rideId column and its constraints
ALTER TABLE "CustomerVehicle" DROP CONSTRAINT IF EXISTS "CustomerVehicle_rideId_fkey";
ALTER TABLE "CustomerVehicle" DROP CONSTRAINT IF EXISTS "CustomerVehicle_rideId_key";
ALTER TABLE "CustomerVehicle" DROP COLUMN "rideId";
