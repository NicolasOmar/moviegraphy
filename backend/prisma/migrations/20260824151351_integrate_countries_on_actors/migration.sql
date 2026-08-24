-- CreateTable
CREATE TABLE "CountriesOnActors" (
    "actorId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountriesOnActors_pkey" PRIMARY KEY ("actorId","countryId")
);

-- AddForeignKey
ALTER TABLE "CountriesOnActors" ADD CONSTRAINT "CountriesOnActors_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Actors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountriesOnActors" ADD CONSTRAINT "CountriesOnActors_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
