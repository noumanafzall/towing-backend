-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DRIVER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "profilePic" TEXT,
    "zipcode" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "licenseUrl" TEXT,
    "insuranceUrl" TEXT,
    "vehiclePhotos" TEXT[],
    "truckType" TEXT,
    "truckCapacity" TEXT,
    "truckPhotos" TEXT[],
    "languages" TEXT[],
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "ratings" DOUBLE PRECISION DEFAULT 0.0,
    "billingType" TEXT DEFAULT 'N/A',
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "city" TEXT,
    "totalEarnings" DOUBLE PRECISION DEFAULT 0.0,
    "experience" INTEGER DEFAULT 0,

    CONSTRAINT "DriverProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DriverTaxProfile" (
    "id" SERIAL NOT NULL,
    "driverProfileId" INTEGER NOT NULL,
    "legalName" TEXT NOT NULL,
    "ssnOrEin" TEXT NOT NULL,
    "mailingAddress" TEXT NOT NULL,
    "consent1099" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverTaxProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalAmountSpent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ride" (
    "id" SERIAL NOT NULL,
    "driverId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "dropoffLocation" TEXT,
    "dropoffDateTime" TIMESTAMP(3),
    "expectedDropoff" TIMESTAMP(3),
    "status" "RideStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DriverProfile_userId_key" ON "DriverProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DriverTaxProfile_driverProfileId_key" ON "DriverTaxProfile"("driverProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- AddForeignKey
ALTER TABLE "DriverProfile" ADD CONSTRAINT "DriverProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DriverTaxProfile" ADD CONSTRAINT "DriverTaxProfile_driverProfileId_fkey" FOREIGN KEY ("driverProfileId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ride" ADD CONSTRAINT "Ride_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
