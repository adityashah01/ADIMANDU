-- CreateEnum
CREATE TYPE "ServiceCategoryType" AS ENUM ('FIXED_PRICE', 'INSPECTION_BASED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('FIXED_PRICE', 'INSPECTION');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'ESCROW_HELD', 'INSPECTION_PAID', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PAYMENT_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'QUOTE_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'QUOTE_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'QUOTE_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'INSPECTION_REQUESTED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingType" "BookingType" NOT NULL DEFAULT 'FIXED_PRICE',
ADD COLUMN     "customerConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "escrowAmount" DECIMAL(10,2),
ADD COLUMN     "inspectionFee" DECIMAL(10,2),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "paymentTxnId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" "ServiceCategoryType" NOT NULL DEFAULT 'FIXED_PRICE';

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_bookingId_key" ON "Quote"("bookingId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
