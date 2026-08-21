-- CreateEnum
CREATE TYPE "StartupType" AS ENUM ('Startup', 'ScaleUp', 'Unicorn', 'Bootstrapped', 'Public');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('Idea', 'PreSeed', 'Seed', 'SeriesA', 'SeriesB', 'SeriesCPlus', 'Growth');

-- CreateEnum
CREATE TYPE "InvestorType" AS ENUM ('VentureCapital', 'AngelSyndicate', 'MicroVC', 'FamilyOffice', 'CorporateVC');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('Remote', 'OnSite', 'Hybrid');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FullTime', 'PartTime', 'Contract', 'Internship');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('pending', 'in_review', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "BookmarkType" AS ENUM ('startup', 'job', 'founder', 'investor');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('Noida', 'GreaterNoida', 'YamunaExpressway');

-- CreateTable
CREATE TABLE "areas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "city" "City" NOT NULL,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "popularHubs" TEXT[],
    "topSectors" TEXT[],
    "connectivity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "startups" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "logo" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "foundedYear" INTEGER NOT NULL,
    "type" "StartupType" NOT NULL,
    "stage" "StartupStage" NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "employeeRange" TEXT NOT NULL,
    "totalFunding" TEXT NOT NULL,
    "techStack" TEXT[],
    "linkedin" TEXT NOT NULL,
    "twitter" TEXT,
    "github" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "hiring" BOOLEAN NOT NULL DEFAULT false,
    "sectors" TEXT[],
    "jobsCount" INTEGER NOT NULL DEFAULT 0,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "areaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "startups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founders" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "coverImage" TEXT,
    "role" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "linkedin" TEXT NOT NULL,
    "twitter" TEXT,
    "github" TEXT,
    "email" TEXT,
    "sectors" TEXT[],
    "stage" "StartupStage" NOT NULL,
    "location" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "previousCompanies" TEXT[],
    "education" TEXT,
    "skills" TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "startupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investors" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "type" "InvestorType" NOT NULL,
    "stages" TEXT[],
    "focusSectors" TEXT[],
    "location" TEXT NOT NULL,
    "checkSize" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "linkedin" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalInvestments" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "logo" TEXT,
    "sector" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,

    CONSTRAINT "portfolio_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funding_rounds" (
    "id" TEXT NOT NULL,
    "roundType" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "valuation" TEXT,
    "leadInvestors" TEXT[],
    "startupId" TEXT NOT NULL,

    CONSTRAINT "funding_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "workMode" "WorkMode" NOT NULL,
    "type" "JobType" NOT NULL,
    "experience" TEXT NOT NULL,
    "salaryRange" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "requirements" TEXT[],
    "skills" TEXT[],
    "postedDate" TEXT NOT NULL,
    "isFresherFriendly" BOOLEAN NOT NULL DEFAULT false,
    "isInternship" BOOLEAN NOT NULL DEFAULT false,
    "applyUrl" TEXT,
    "contactEmail" TEXT NOT NULL,
    "startupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "foundedYear" INTEGER NOT NULL,
    "type" "StartupType" NOT NULL,
    "stage" "StartupStage" NOT NULL,
    "sector" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "areaName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "founderName" TEXT NOT NULL,
    "founderRole" TEXT NOT NULL,
    "founderEmail" TEXT NOT NULL,
    "founderLinkedin" TEXT NOT NULL,
    "employeeRange" TEXT NOT NULL,
    "totalFunding" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "techStack" TEXT NOT NULL,
    "hiring" BOOLEAN NOT NULL DEFAULT false,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "type" "BookmarkType" NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "sessionId" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_slug_key" ON "areas"("slug");

-- CreateIndex
CREATE INDEX "areas_slug_idx" ON "areas"("slug");

-- CreateIndex
CREATE INDEX "areas_city_idx" ON "areas"("city");

-- CreateIndex
CREATE UNIQUE INDEX "startups_slug_key" ON "startups"("slug");

-- CreateIndex
CREATE INDEX "startups_slug_idx" ON "startups"("slug");

-- CreateIndex
CREATE INDEX "startups_areaId_idx" ON "startups"("areaId");

-- CreateIndex
CREATE INDEX "startups_stage_idx" ON "startups"("stage");

-- CreateIndex
CREATE INDEX "startups_verified_idx" ON "startups"("verified");

-- CreateIndex
CREATE INDEX "startups_hiring_idx" ON "startups"("hiring");

-- CreateIndex
CREATE INDEX "startups_sectors_idx" ON "startups"("sectors");

-- CreateIndex
CREATE INDEX "startups_createdAt_idx" ON "startups"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "founders_slug_key" ON "founders"("slug");

-- CreateIndex
CREATE INDEX "founders_slug_idx" ON "founders"("slug");

-- CreateIndex
CREATE INDEX "founders_startupId_idx" ON "founders"("startupId");

-- CreateIndex
CREATE UNIQUE INDEX "investors_slug_key" ON "investors"("slug");

-- CreateIndex
CREATE INDEX "investors_slug_idx" ON "investors"("slug");

-- CreateIndex
CREATE INDEX "jobs_startupId_idx" ON "jobs"("startupId");

-- CreateIndex
CREATE INDEX "submissions_status_idx" ON "submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_userId_type_itemId_key" ON "bookmarks"("userId", "type", "itemId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_entityType_entityId_idx" ON "analytics_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- AddForeignKey
ALTER TABLE "startups" ADD CONSTRAINT "startups_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founders" ADD CONSTRAINT "founders_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_companies" ADD CONSTRAINT "portfolio_companies_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_rounds" ADD CONSTRAINT "funding_rounds_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
