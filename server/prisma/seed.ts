/**
 * Seed Pipeline
 *
 * Transforms the existing frontend seedData.ts into normalized
 * PostgreSQL records via Prisma, preserving all entity IDs and
 * relationships.
 *
 * Usage: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

// ─── Enum Mappers ─────────────────────────────────────────────────────────────
// The frontend uses display strings ('Scale-up', 'Pre-seed', etc.)
// but Prisma enums use PascalCase identifiers. These maps convert.

const startupTypeMap: Record<string, string> = {
  'Startup': 'Startup',
  'Scale-up': 'ScaleUp',
  'Unicorn': 'Unicorn',
  'Bootstrapped': 'Bootstrapped',
  'Public': 'Public',
};

const startupStageMap: Record<string, string> = {
  'Idea': 'Idea',
  'Pre-seed': 'PreSeed',
  'Seed': 'Seed',
  'Series A': 'SeriesA',
  'Series B': 'SeriesB',
  'Series C+': 'SeriesCPlus',
  'Growth': 'Growth',
};

const investorTypeMap: Record<string, string> = {
  'Venture Capital': 'VentureCapital',
  'Angel Syndicate': 'AngelSyndicate',
  'Micro VC': 'MicroVC',
  'Family Office': 'FamilyOffice',
  'Corporate VC': 'CorporateVC',
};

const workModeMap: Record<string, string> = {
  'Remote': 'Remote',
  'On-site': 'OnSite',
  'Hybrid': 'Hybrid',
};

const jobTypeMap: Record<string, string> = {
  'Full-time': 'FullTime',
  'Part-time': 'PartTime',
  'Contract': 'Contract',
  'Internship': 'Internship',
};

const cityMap: Record<string, string> = {
  'Noida': 'Noida',
  'Greater Noida': 'GreaterNoida',
  'Yamuna Expressway': 'YamunaExpressway',
};

// ─── Import Seed Data ─────────────────────────────────────────────────────────
// Dynamic import of the frontend seed data file.

async function loadSeedData() {
  // The seed data file uses TypeScript with frontend imports.
  // We need to import it. Since it's a pure data module with type imports,
  // tsx can handle it directly.
  const seedPath = path.resolve(__dirname, '../../src/data/seedData.ts');
  const seedModule = await import(seedPath);
  return {
    areas: seedModule.SEED_AREAS,
    startups: seedModule.SEED_STARTUPS,
    founders: seedModule.SEED_FOUNDERS,
    investors: seedModule.SEED_INVESTORS,
    jobs: seedModule.SEED_JOBS,
    submissions: seedModule.SEED_SUBMISSIONS,
  };
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

// ─── ID Correction Map ──────────────────────────────────────────────────────
// The frontend seed data has some inconsistent IDs between entities.
// This map fixes known mismatches.
const startupIdCorrections: Record<string, string> = {
  'st-voltmobility': 'st-volt-mobility',
};

function fixStartupId(id: string): string {
  return startupIdCorrections[id] || id;
}

async function main() {
  console.log('🌱 Starting seed pipeline...\n');

  const data = await loadSeedData();

  // Build a set of valid startup IDs for FK validation
  const validStartupIds = new Set(data.startups.map((s: any) => s.id));

  // 1. Seed Areas
  console.log(`📍 Seeding ${data.areas.length} areas...`);
  for (const area of data.areas) {
    await prisma.area.upsert({
      where: { id: area.id },
      update: {},
      create: {
        id: area.id,
        slug: area.slug,
        name: area.name,
        shortName: area.shortName,
        city: cityMap[area.city] as any,
        description: area.description,
        latitude: area.latitude,
        longitude: area.longitude,
        popularHubs: area.popularHubs,
        topSectors: area.topSectors,
        connectivity: area.connectivity,
      },
    });
  }
  console.log('   ✅ Areas seeded.\n');

  // 2. Seed Startups (with nested founders, funding rounds, products)
  console.log(`🚀 Seeding ${data.startups.length} startups...`);
  for (const startup of data.startups) {
    await prisma.startup.upsert({
      where: { id: startup.id },
      update: {},
      create: {
        id: startup.id,
        slug: startup.slug,
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description,
        longDescription: startup.longDescription || null,
        logo: startup.logo,
        website: startup.website,
        foundedYear: startup.foundedYear,
        type: (startupTypeMap[startup.type] || startup.type) as any,
        stage: (startupStageMap[startup.stage] || startup.stage) as any,
        areaId: startup.areaId,
        address: startup.address,
        latitude: startup.latitude,
        longitude: startup.longitude,
        employeeRange: startup.employeeRange,
        totalFunding: startup.totalFunding,
        techStack: startup.techStack,
        linkedin: startup.linkedin,
        twitter: startup.twitter || null,
        github: startup.github || null,
        verified: startup.verified,
        hiring: startup.hiring,
        sectors: startup.sectors,
        jobsCount: startup.jobsCount,
        viewsCount: startup.viewsCount || 0,
        createdAt: new Date(startup.createdAt),
        updatedAt: new Date(startup.updatedAt),
        // Nested creates for funding rounds
        fundingRounds: {
          create: (startup.fundingRounds || []).map((fr: any) => ({
            id: fr.id,
            roundType: fr.roundType,
            amount: fr.amount,
            date: fr.date,
            leadInvestors: fr.leadInvestors,
            valuation: fr.valuation || null,
          })),
        },
        // Nested creates for products
        products: {
          create: (startup.products || []).map((p: any) => ({
            name: p.name,
            description: p.description,
          })),
        },
      },
    });
  }
  console.log('   ✅ Startups seeded.\n');

  // 3. Seed Founders (separate from startup.founders FounderRef)
  // The SEED_FOUNDERS array has full founder details, while startup.founders
  // only has FounderRef (id, name, slug, role, photo). We use the full data.
  console.log(`👤 Seeding ${data.founders.length} founders...`);
  let founderSkipped = 0;
  for (const founder of data.founders) {
    const correctedStartupId = fixStartupId(founder.startupId);
    if (!validStartupIds.has(correctedStartupId)) {
      console.warn(`   ⚠️  Skipping founder "${founder.name}" — startup ID "${founder.startupId}" not found.`);
      founderSkipped++;
      continue;
    }
    await prisma.founder.upsert({
      where: { id: founder.id },
      update: {},
      create: {
        id: founder.id,
        slug: founder.slug,
        name: founder.name,
        photo: founder.photo,
        coverImage: founder.coverImage || null,
        role: founder.role,
        bio: founder.bio,
        linkedin: founder.linkedin,
        twitter: founder.twitter || null,
        github: founder.github || null,
        email: founder.email || null,
        sectors: founder.sectors,
        stage: (startupStageMap[founder.stage] || founder.stage) as any,
        location: founder.location,
        areaId: founder.areaId,
        previousCompanies: founder.previousCompanies || [],
        education: founder.education || null,
        skills: founder.skills,
        verified: founder.verified,
        startupId: correctedStartupId,
      },
    });
  }
  console.log(`   ✅ Founders seeded (${founderSkipped} skipped).\n`);

  // 4. Seed Investors (with nested portfolio companies)
  console.log(`💰 Seeding ${data.investors.length} investors...`);
  for (const investor of data.investors) {
    await prisma.investor.upsert({
      where: { id: investor.id },
      update: {},
      create: {
        id: investor.id,
        slug: investor.slug,
        name: investor.name,
        logo: investor.logo,
        type: (investorTypeMap[investor.type] || investor.type) as any,
        stages: investor.stages,
        focusSectors: investor.focusSectors,
        location: investor.location,
        checkSize: investor.checkSize,
        website: investor.website,
        linkedin: investor.linkedin,
        description: investor.description,
        totalInvestments: investor.totalInvestments,
        portfolioCompanies: {
          create: (investor.portfolioCompanies || []).map((pc: any) => ({
            name: pc.name,
            slug: pc.slug || null,
            logo: pc.logo || null,
            sector: pc.sector,
          })),
        },
      },
    });
  }
  console.log('   ✅ Investors seeded.\n');

  // 5. Seed Jobs
  console.log(`💼 Seeding ${data.jobs.length} jobs...`);
  let jobSkipped = 0;
  for (const job of data.jobs) {
    const correctedStartupId = fixStartupId(job.startupId);
    if (!validStartupIds.has(correctedStartupId)) {
      console.warn(`   ⚠️  Skipping job "${job.title}" — startup ID "${job.startupId}" not found.`);
      jobSkipped++;
      continue;
    }
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        title: job.title,
        startupId: correctedStartupId,
        location: job.location,
        areaName: job.areaName,
        workMode: (workModeMap[job.workMode] || job.workMode) as any,
        type: (jobTypeMap[job.type] || job.type) as any,
        experience: job.experience,
        salaryRange: job.salaryRange,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        skills: job.skills,
        postedDate: job.postedDate,
        isFresherFriendly: job.isFresherFriendly,
        isInternship: job.isInternship,
        applyUrl: job.applyUrl || null,
        contactEmail: job.contactEmail,
      },
    });
  }
  console.log(`   ✅ Jobs seeded (${jobSkipped} skipped).\n`);

  // 6. Seed Submissions
  console.log(`📝 Seeding ${data.submissions.length} submissions...`);
  for (const sub of data.submissions) {
    await prisma.submission.upsert({
      where: { id: sub.id },
      update: {},
      create: {
        id: sub.id,
        companyName: sub.companyName,
        tagline: sub.tagline,
        website: sub.website,
        foundedYear: sub.foundedYear,
        type: (startupTypeMap[sub.type] || sub.type) as any,
        stage: (startupStageMap[sub.stage] || sub.stage) as any,
        sector: sub.sector,
        areaId: sub.areaId,
        areaName: sub.areaName,
        address: sub.address,
        founderName: sub.founderName,
        founderRole: sub.founderRole,
        founderEmail: sub.founderEmail,
        founderLinkedin: sub.founderLinkedin,
        employeeRange: sub.employeeRange,
        totalFunding: sub.totalFunding,
        description: sub.description,
        techStack: sub.techStack,
        hiring: sub.hiring,
        status: sub.status as any,
        submittedAt: new Date(sub.submittedAt),
        notes: sub.notes || null,
      },
    });
  }
  console.log('   ✅ Submissions seeded.\n');

  // 7. Seed Admin User
  console.log('🔐 Seeding admin user...');
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@noidaatlas.dev';
  const adminPassword = process.env.ADMIN_PASSWORD;

  const WEAK_PASSWORDS = [
    'admin',
    'admin123',
    'admin1234',
    'password',
    'password123',
    '123456',
    '12345678',
    'dev-admin-pass-change-in-env',
    'change-me',
    'change-in-env',
    'placeholder',
    'your_secure_admin_password',
  ];

  const isWeak = !adminPassword || adminPassword.trim().length < 10 || WEAK_PASSWORDS.some((w) => adminPassword.toLowerCase().includes(w));

  if (isProduction && isWeak) {
    throw new Error('SECURITY FATAL: Cannot seed admin user in production without an explicit, non-default, secure ADMIN_PASSWORD environment variable.');
  }

  const effectivePassword = adminPassword || 'dev-admin-pass-change-in-env';
  const passwordHash = await bcrypt.hash(effectivePassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: 'admin' },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Atlas Admin',
      role: 'admin',
    },
  });
  console.log(`   ✅ Admin user created: ${adminEmail}\n`);

  // Summary
  const counts = await Promise.all([
    prisma.area.count(),
    prisma.startup.count(),
    prisma.founder.count(),
    prisma.investor.count(),
    prisma.job.count(),
    prisma.submission.count(),
    prisma.user.count(),
  ]);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Seed complete! Database summary:');
  console.log(`   Areas:       ${counts[0]}`);
  console.log(`   Startups:    ${counts[1]}`);
  console.log(`   Founders:    ${counts[2]}`);
  console.log(`   Investors:   ${counts[3]}`);
  console.log(`   Jobs:        ${counts[4]}`);
  console.log(`   Submissions: ${counts[5]}`);
  console.log(`   Users:       ${counts[6]}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
