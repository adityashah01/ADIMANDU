/*
  Warnings:

  - The values [PENDING] on the enum `QuoteStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `type` on the `Category` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceRequestId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('FIXED_PRICE', 'INSPECTION_BASED');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('PENDING', 'CONSULTATION', 'INSPECTION_REQUESTED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'QUOTE_SENT', 'QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SERVICE_PAYMENT', 'INSPECTION_PAYMENT', 'PLATFORM_FEE', 'PROVIDER_EARNING', 'REFUND', 'PAYOUT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_REQUEST_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_REQUEST_UPDATED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE 'PAID';
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_PENDING';

-- AlterEnum
BEGIN;
CREATE TYPE "QuoteStatus_new" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');
ALTER TABLE "public"."Quote" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Quote" ALTER COLUMN "status" TYPE "QuoteStatus_new" USING ("status"::text::"QuoteStatus_new");
ALTER TYPE "QuoteStatus" RENAME TO "QuoteStatus_old";
ALTER TYPE "QuoteStatus_new" RENAME TO "QuoteStatus";
DROP TYPE "public"."QuoteStatus_old";
ALTER TABLE "Quote" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "catalogServiceId" TEXT;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "serviceRequestId" TEXT,
ALTER COLUMN "bookingId" DROP NOT NULL;

-- DropEnum
DROP TYPE "ServiceCategoryType";

-- CreateTable
CREATE TABLE "CatalogService" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'FIXED_PRICE',
    "basePrice" DECIMAL(10,2),
    "inspectionFee" DECIMAL(10,2),
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderService" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "catalogServiceId" TEXT NOT NULL,
    "customPrice" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProviderService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "catalogServiceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "inspectionFee" DECIMAL(10,2),
    "finalAmount" DECIMAL(10,2),
    "paymentMethod" TEXT,
    "paymentTxnId" TEXT,
    "escrowAmount" DECIMAL(10,2),
    "customerConfirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "scheduledTime" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'REQUESTED',
    "diagnosis" TEXT,
    "providerNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceQuote" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "diagnosis" TEXT,
    "labourCost" DECIMAL(10,2) NOT NULL,
    "partsCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "inspectionCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3),
    "customerResponse" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "serviceRequestId" TEXT,
    "providerId" TEXT,
    "customerId" TEXT,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogService_slug_key" ON "CatalogService"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderService_providerId_catalogServiceId_key" ON "ProviderService"("providerId", "catalogServiceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceRequest_requestNumber_key" ON "ServiceRequest"("requestNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Inspection_serviceRequestId_key" ON "Inspection"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceQuote_serviceRequestId_key" ON "ServiceQuote"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_serviceRequestId_key" ON "Review"("serviceRequestId");

-- AddForeignKey
ALTER TABLE "CatalogService" ADD CONSTRAINT "CatalogService_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderService" ADD CONSTRAINT "ProviderService_catalogServiceId_fkey" FOREIGN KEY ("catalogServiceId") REFERENCES "CatalogService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_catalogServiceId_fkey" FOREIGN KEY ("catalogServiceId") REFERENCES "CatalogService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_catalogServiceId_fkey" FOREIGN KEY ("catalogServiceId") REFERENCES "CatalogService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceQuote" ADD CONSTRAINT "ServiceQuote_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceQuote" ADD CONSTRAINT "ServiceQuote_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
