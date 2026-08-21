/**
 * Job Business Service
 */

import { jobRepo, JobFilters } from '../repositories/jobRepo.js';
import { NotFoundError } from '../utils/errors.js';
import { prisma } from '../db.js';

export const jobService = {
  async getAllJobs(filters: JobFilters) {
    return jobRepo.filter(filters);
  },

  async getJobById(id: string) {
    const job = await jobRepo.findById(id);
    if (!job) {
      throw new NotFoundError(`Job with ID "${id}" not found`);
    }
    return job;
  },

  async getJobsByStartup(startupId: string) {
    return jobRepo.findByStartup(startupId);
  },

  async createJob(data: any) {
    const { startupId, ...rest } = data;

    // Verify startup exists
    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) {
      throw new NotFoundError(`Startup with ID "${startupId}" not found`);
    }

    const jobData: any = {
      ...rest,
      startup: { connect: { id: startupId } },
    };

    const newJob = await jobRepo.create(jobData);

    // Update startup jobsCount & hiring flag
    await prisma.startup.update({
      where: { id: startupId },
      data: {
        jobsCount: { increment: 1 },
        hiring: true,
      },
    });

    return newJob;
  },

  async updateJob(id: string, data: any) {
    const existing = await jobRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Job with ID "${id}" not found`);
    }
    return prisma.job.update({ where: { id }, data });
  },

  async deleteJob(id: string) {
    const existing = await jobRepo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Job with ID "${id}" not found`);
    }
    await prisma.job.delete({ where: { id } });

    // Decrement jobsCount on startup
    const remainingJobsCount = await prisma.job.count({ where: { startupId: existing.startupId } });
    await prisma.startup.update({
      where: { id: existing.startupId },
      data: {
        jobsCount: remainingJobsCount,
        hiring: remainingJobsCount > 0,
      },
    });

    return { success: true };
  },
};
