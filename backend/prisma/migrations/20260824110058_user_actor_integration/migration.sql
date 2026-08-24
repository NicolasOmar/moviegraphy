/*
  Warnings:

  - Added the required column `userId` to the `Actors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Actors" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Actors" ADD CONSTRAINT "Actors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
