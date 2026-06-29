/*
  Warnings:

  - Added the required column `name` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `desc` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `img` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('clothes', 'electronics', 'furnitures', 'toys', 'others');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "name" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'others',
ADD COLUMN     "desc" VARCHAR(150) NOT NULL,
ADD COLUMN     "img" TEXT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT;
