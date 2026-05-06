-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "razorpayOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_razorpayOrderId_key" ON "Booking"("razorpayOrderId");
