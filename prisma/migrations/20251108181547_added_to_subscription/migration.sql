/*
  Warnings:

  - You are about to drop the column `periodEnd` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `periodStart` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Made the column `polarCustomerId` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "periodEnd",
DROP COLUMN "periodStart",
ADD COLUMN     "amount" INTEGER,
ADD COLUMN     "canceledAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3),
ADD COLUMN     "polarCheckoutId" TEXT,
ADD COLUMN     "polarProductId" TEXT,
ADD COLUMN     "recurringInterval" TEXT,
ADD COLUMN     "recurringIntervalCount" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "polarCustomerId" SET NOT NULL;
