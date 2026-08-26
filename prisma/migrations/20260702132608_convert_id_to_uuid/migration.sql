/*
  Warnings:

  - The primary key for the `todos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `todos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "todos" DROP CONSTRAINT "todos_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");
