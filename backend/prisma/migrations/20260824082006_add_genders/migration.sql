/*
  Warnings:

  - Added the required column `genderId` to the `Actors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Actors" ADD COLUMN     "genderId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Genders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genders_id_key" ON "Genders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Genders_name_key" ON "Genders"("name");

-- AddForeignKey
ALTER TABLE "Actors" ADD CONSTRAINT "Actors_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "Genders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
