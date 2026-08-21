-- CreateTable
CREATE TABLE "Countries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officialName" TEXT,
    "alpha2" TEXT NOT NULL,
    "alpha3" TEXT NOT NULL,

    CONSTRAINT "Countries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Countries_id_key" ON "Countries"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Countries_name_key" ON "Countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Countries_officialName_key" ON "Countries"("officialName");

-- CreateIndex
CREATE UNIQUE INDEX "Countries_alpha2_key" ON "Countries"("alpha2");

-- CreateIndex
CREATE UNIQUE INDEX "Countries_alpha3_key" ON "Countries"("alpha3");
