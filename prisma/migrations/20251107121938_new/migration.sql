/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "polarCustomerId" TEXT,
ADD COLUMN     "polarSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "stripeCustomerId",
ADD COLUMN     "polarCustomerId" TEXT;
