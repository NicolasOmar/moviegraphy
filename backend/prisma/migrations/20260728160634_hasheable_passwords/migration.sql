-- AlterTable
ALTER TABLE "Movies" RENAME CONSTRAINT "Movie_pkey" TO "Movies_pkey";

-- AlterTable
ALTER TABLE "Sessions" RENAME CONSTRAINT "RefreshToken_pkey" TO "Sessions_pkey";

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "password" SET DATA TYPE TEXT;
ALTER TABLE "Users" RENAME CONSTRAINT "User_pkey" TO "Users_pkey";

-- RenameForeignKey
ALTER TABLE "Sessions" RENAME CONSTRAINT "RefreshToken_userId_fkey" TO "Sessions_userId_fkey";

-- RenameIndex
ALTER INDEX "Movie_id_key" RENAME TO "Movies_id_key";

-- RenameIndex
ALTER INDEX "RefreshToken_token_key" RENAME TO "Sessions_token_key";

-- RenameIndex
ALTER INDEX "RefreshToken_userId_idx" RENAME TO "Sessions_userId_idx";

-- RenameIndex
ALTER INDEX "User_email_key" RENAME TO "Users_email_key";

-- RenameIndex
ALTER INDEX "User_id_key" RENAME TO "Users_id_key";
