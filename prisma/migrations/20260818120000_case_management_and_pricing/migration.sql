-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('DOLMETSCHEN', 'SOZIALBETREUUNG', 'SPRACHKURS', 'VERWALTUNGSBEGLEITUNG', 'SONSTIGES');

-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('AKTIV', 'ABGESCHLOSSEN');

-- CreateTable
CREATE TABLE "pricing_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "clientRatePerJob" DECIMAL(10,2),
    "interpreterRatePerJob" DECIMAL(10,2),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "humanId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "langs" TEXT[],
    "contact" TEXT,
    "status" "ResidentStatus" NOT NULL DEFAULT 'AKTIV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident_services" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "startedAt" DATE NOT NULL DEFAULT CURRENT_DATE,
    "note" TEXT,

    CONSTRAINT "resident_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_notes" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "text" TEXT NOT NULL,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "residents_humanId_key" ON "residents"("humanId");

-- CreateIndex
CREATE UNIQUE INDEX "resident_services_residentId_type_key" ON "resident_services"("residentId", "type");

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_services" ADD CONSTRAINT "resident_services_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
