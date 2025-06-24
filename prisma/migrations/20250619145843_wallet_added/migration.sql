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

-- AddForeignKey
ALTER TABLE "LocationUpdate" ADD CONSTRAINT "LocationUpdate_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "Ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationUpdate" ADD CONSTRAINT "LocationUpdate_lastLocationForRideId_fkey" FOREIGN KEY ("lastLocationForRideId") REFERENCES "Ride"("id") ON DELETE SET NULL ON UPDATE CASCADE;
