-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'BUERO', 'INTERPRETER');

-- CreateEnum
CREATE TYPE "Salutation" AS ENUM ('HERR', 'FRAU');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('AKTIV', 'EINGELADEN', 'INAKTIV');

-- CreateEnum
CREATE TYPE "InterpreterStatus" AS ENUM ('AKTIV', 'URLAUB', 'INAKTIV');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('AKTIV', 'INAKTIV');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('OFFEN', 'UEBERFAELLIG', 'BEZAHLT');

-- CreateEnum
CREATE TYPE "EmailImportStatus" AS ENUM ('NEU', 'IN_BEARBEITUNG', 'ABGELEHNT');

-- CreateEnum
CREATE TYPE "WorkflowStage" AS ENUM ('GESUCHT', 'WARTET', 'BESTAETIGT', 'ABGELEHNT');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('OFFEN', 'ZUGEWIESEN');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('AKTUELL', 'LAEUFT_AB', 'FEHLT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'AKTIV',
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "id_sequences" (
    "key" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "id_sequences_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "interpreters" (
    "id" TEXT NOT NULL,
    "humanId" TEXT NOT NULL,
    "salutation" "Salutation" NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "langs" TEXT[],
    "status" "InterpreterStatus" NOT NULL DEFAULT 'AKTIV',
    "rating" DECIMAL(2,1) NOT NULL DEFAULT 0,
    "payoutTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "interpreters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" "ClientStatus" NOT NULL DEFAULT 'AKTIV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dueDate" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'OFFEN',
    "sevdeskInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_imports" (
    "id" TEXT NOT NULL,
    "residentName" TEXT NOT NULL,
    "regNr" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "note" TEXT,
    "status" "EmailImportStatus" NOT NULL DEFAULT 'NEU',
    "workflowStage" "WorkflowStage" NOT NULL DEFAULT 'GESUCHT',
    "matchedInterpreterId" TEXT,
    "matchScore" INTEGER,
    "createdJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispatch_jobs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "interpreterId" TEXT,
    "langPair" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "status" "DispatchStatus" NOT NULL DEFAULT 'OFFEN',
    "suggestedName" TEXT,
    "matchScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispatch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "interpreterId" TEXT,
    "langPair" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'FEHLT',
    "expiresAt" DATE,
    "fileUrl" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "uploadedById" TEXT,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "interpreterId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "link" TEXT,
    "unread" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "sevdeskConnected" BOOLEAN NOT NULL DEFAULT false,
    "sevdeskOrgName" TEXT,
    "emailImportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailImportAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "interpreters_humanId_key" ON "interpreters"("humanId");

-- CreateIndex
CREATE UNIQUE INDEX "interpreters_userId_key" ON "interpreters"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "availability_interpreterId_date_key" ON "availability"("interpreterId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE UNIQUE INDEX "email_imports_createdJobId_key" ON "email_imports"("createdJobId");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- AddForeignKey
ALTER TABLE "interpreters" ADD CONSTRAINT "interpreters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability" ADD CONSTRAINT "availability_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_imports" ADD CONSTRAINT "email_imports_matchedInterpreterId_fkey" FOREIGN KEY ("matchedInterpreterId") REFERENCES "interpreters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_imports" ADD CONSTRAINT "email_imports_createdJobId_fkey" FOREIGN KEY ("createdJobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_jobs" ADD CONSTRAINT "dispatch_jobs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_jobs" ADD CONSTRAINT "dispatch_jobs_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "interpreters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "interpreters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_interpreterId_fkey" FOREIGN KEY ("interpreterId") REFERENCES "interpreters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
