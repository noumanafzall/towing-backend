-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "driverShare" DOUBLE PRECISION,
ADD COLUMN     "platformFee" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "DriverEarning" (
    "id" SERIAL NOT NULL,
    "rideId" INTEGER NOT NULL,
    "driverId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverEarning_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DriverEarning_rideId_key" ON "DriverEarning"("rideId");

-- CreateIndex
CREATE INDEX "DriverEarning_driverId_idx" ON "DriverEarning"("driverId");

-- AddForeignKey
ALTER TABLE "DriverEarning" ADD CONSTRAINT "DriverEarning_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverEarning" ADD CONSTRAINT "DriverEarning_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
