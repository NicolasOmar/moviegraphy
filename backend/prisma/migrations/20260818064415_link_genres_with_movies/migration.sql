/*
  Warnings:

  - You are about to drop the `_GenresToMovies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_GenresToMovies" DROP CONSTRAINT "_GenresToMovies_A_fkey";

-- DropForeignKey
ALTER TABLE "_GenresToMovies" DROP CONSTRAINT "_GenresToMovies_B_fkey";

-- DropTable
DROP TABLE "_GenresToMovies";

-- CreateTable
CREATE TABLE "GenresOnMovies" (
    "movieId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenresOnMovies_pkey" PRIMARY KEY ("movieId","genreId")
);

-- AddForeignKey
ALTER TABLE "GenresOnMovies" ADD CONSTRAINT "GenresOnMovies_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenresOnMovies" ADD CONSTRAINT "GenresOnMovies_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;
