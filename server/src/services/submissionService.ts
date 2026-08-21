/**
 * Submission Business Service
 */

import { submissionRepo } from '../repositories/submissionRepo.js';
import { startupRepo } from '../repositories/startupRepo.js';
import { generateSlug } from '../utils/slug.js';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/errors.js';
import { prisma } from '../db.js';
import { logger } from '../utils/logger.js';

const typeEnumMap: Record<string, string> = {
  'Startup': 'Startup',
  'Scale-up': 'ScaleUp',
  'Unicorn': 'Unicorn',
  'Bootstrapped': 'Bootstrapped',
  'Public': 'Public',
};

const stageEnumMap: Record<string, string> = {
  'Idea': 'Idea',
  'Pre-seed': 'PreSeed',
  'Seed': 'Seed',
  'Series A': 'SeriesA',
  'Series B': 'SeriesB',
  'Series C+': 'SeriesCPlus',
  'Growth': 'Growth',
};

export const submissionService = {
  async getAllSubmissions() {
    return submissionRepo.findAll();
  },

  async getSubmissionById(id: string) {
    const sub = await submissionRepo.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with ID "${id}" not found`);
    }
    return sub;
  },

  async createSubmission(data: any) {
    const companyName = data.companyName.trim();
    const website = data.website.trim().toLowerCase();

    // 1. Duplicate check against existing startups
    const existingStartupByName = await prisma.startup.findFirst({
      where: { name: { equals: companyName, mode: 'insensitive' } },
    });
    if (existingStartupByName) {
      throw new ConflictError(`A company named "${companyName}" is already listed on the Atlas`);
    }

    const existingStartupByWeb = await prisma.startup.findFirst({
      where: { website: { equals: website, mode: 'insensitive' } },
    });
    if (existingStartupByWeb) {
      throw new ConflictError(`A company with website "${website}" is already listed on the Atlas`);
    }

    // 2. Duplicate check against pending submissions
    const existingSub = await prisma.submission.findFirst({
      where: {
        OR: [
          { companyName: { equals: companyName, mode: 'insensitive' } },
          { website: { equals: website, mode: 'insensitive' } },
        ],
        status: { in: ['pending', 'in_review'] },
      },
    });
    if (existingSub) {
      throw new ConflictError('A submission for this company is already pending review');
    }

    // 3. Strip any attempt to set status, verified, or admin fields
    const sanitizedData = {
      ...data,
      companyName,
      website,
      type: (typeEnumMap[data.type] || data.type) as any,
      stage: (stageEnumMap[data.stage] || data.stage) as any,
      status: 'pending' as const, // Force pending
    };

    const newSub = await submissionRepo.create(sanitizedData);

    logger.security({
      event: 'SUBMISSION_CREATED',
      details: { submissionId: newSub.id, companyName },
    });

    return newSub;
  },

  async updateStatus(
    id: string,
    newStatus: 'pending' | 'in_review' | 'approved' | 'rejected',
    notes?: string,
    coords?: { latitude?: number; longitude?: number }
  ) {
    const sub = await submissionRepo.findById(id);
    if (!sub) {
      throw new NotFoundError(`Submission with ID "${id}" not found`);
    }

    // Status transition validation
    const currentStatus = sub.status;
    if (currentStatus === newStatus) {
      return sub;
    }

    // Allowed transitions:
    // pending -> in_review | approved | rejected
    // in_review -> approved | rejected
    // approved -> cannot un-approve (already published)
    if (currentStatus === 'approved' && newStatus !== 'approved') {
      throw new BadRequestError('Cannot change status of an already approved and published submission');
    }

    // Wrap status update and startup publication in a single database transaction for atomic consistency
    return prisma.$transaction(async (tx) => {
      const updatedSub = await tx.submission.update({
        where: { id },
        data: {
          status: newStatus,
          notes: notes !== undefined ? notes : sub.notes,
          reviewedAt: new Date(),
        },
      });

      // If approved, create Startup record atomically within transaction
      if (newStatus === 'approved') {
        const slug = generateSlug(sub.companyName);

        const lat = coords?.latitude ?? sub.latitude ?? 28.6280;
        const lng = coords?.longitude ?? sub.longitude ?? 77.3649;

        if (typeof lat !== 'number' || typeof lng !== 'number') {
          throw new BadRequestError('Valid latitude and longitude coordinates are required to approve and publish a startup');
        }

        let areaId = sub.areaId;
        const areaExists = await tx.area.findUnique({ where: { id: areaId } });
        if (!areaExists) {
          const defaultArea = await tx.area.findFirst();
          areaId = defaultArea?.id || 'area-sec-62';
        }

        const techStackArr = sub.techStack
          ? sub.techStack.split(',').map((t: string) => t.trim()).filter(Boolean)
          : ['Tech'];

        await tx.startup.create({
          data: {
            name: sub.companyName,
            slug,
            tagline: sub.tagline,
            description: sub.description,
            longDescription: sub.description,
            logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
            website: sub.website,
            foundedYear: sub.foundedYear || new Date().getFullYear(),
            type: (typeEnumMap[sub.type] || sub.type) as any,
            stage: (stageEnumMap[sub.stage] || sub.stage) as any,
            area: { connect: { id: areaId } },
            address: sub.address || 'Noida, UP',
            latitude: lat,
            longitude: lng,
            employeeRange: sub.employeeRange || '10-25',
            totalFunding: sub.totalFunding || 'Undisclosed',
            techStack: techStackArr,
            linkedin: sub.founderLinkedin || sub.website,
            verified: true,
            hiring: sub.hiring || false,
            sectors: [sub.sector],
            founders: {
              create: [
                {
                  name: sub.founderName,
                  slug: generateSlug(`${sub.founderName}-${Date.now()}`),
                  role: sub.founderRole,
                  photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  bio: `${sub.founderRole} at ${sub.companyName}`,
                  linkedin: sub.founderLinkedin,
                  email: sub.founderEmail,
                  sectors: [sub.sector],
                  stage: (stageEnumMap[sub.stage] || sub.stage) as any,
                  location: sub.address || 'Noida',
                  areaId,
                  skills: techStackArr,
                  verified: true,
                },
              ],
            },
          },
        });

        logger.security({
          event: 'SUBMISSION_APPROVED_AND_PUBLISHED',
          details: { submissionId: id, companyName: sub.companyName, slug },
        });
      } else if (newStatus === 'rejected') {
        logger.security({
          event: 'SUBMISSION_REJECTED',
          details: { submissionId: id, companyName: sub.companyName, notes },
        });
      }

      return updatedSub;
    });
  },
};
