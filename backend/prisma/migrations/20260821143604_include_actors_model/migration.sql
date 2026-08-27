-- CreateTable
CREATE TABLE "Actors" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "bornDate" TIMESTAMP(3) NOT NULL,
    "deadDate" TIMESTAMP(3),

    CONSTRAINT "Actors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Actors_id_key" ON "Actors"("id");
