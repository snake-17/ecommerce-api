/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('CREATED', 'RESERVED', 'PAID', 'CANCELLED', 'EXPIRED');

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'CREATED';
