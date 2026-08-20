import { Submission, Startup } from '../types';
import { SEED_SUBMISSIONS } from '../data/seedData';
import { storageService } from './storageService';
import { startupService } from './startupService';

const SUBMISSIONS_KEY = 'noida_atlas_submissions_v1';

export const submissionService = {
  getAllSubmissions(): Submission[] {
    return storageService.getItem<Submission[]>(SUBMISSIONS_KEY, SEED_SUBMISSIONS);
  },

  createSubmission(data: Omit<Submission, 'id' | 'status' | 'submittedAt'>): Submission {
    const submissions = this.getAllSubmissions();
    const newSubmission: Submission = {
      ...data,
      id: `sub-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const updated = [newSubmission, ...submissions];
    storageService.setItem(SUBMISSIONS_KEY, updated);
    return newSubmission;
  },

  updateStatus(id: string, status: Submission['status'], notes?: string): Submission | undefined {
    const submissions = this.getAllSubmissions();
    const idx = submissions.findIndex(s => s.id === id);
    if (idx < 0) return undefined;

    const updatedSubmission: Submission = {
      ...submissions[idx],
      status,
      reviewedAt: new Date().toISOString(),
      notes: notes || submissions[idx].notes,
    };

    submissions[idx] = updatedSubmission;
    storageService.setItem(SUBMISSIONS_KEY, submissions);

    // If approved, automatically convert and publish to startup list!
    if (status === 'approved') {
      const slug = updatedSubmission.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const techStackArr = updatedSubmission.techStack ? updatedSubmission.techStack.split(',').map(t => t.trim()).filter(Boolean) : ['React', 'TypeScript', 'Node.js'];
      
      const newStartup: Startup = {
        id: `st-sub-${Date.now()}`,
        name: updatedSubmission.companyName,
        slug,
        tagline: updatedSubmission.tagline || `${updatedSubmission.companyName} in ${updatedSubmission.sector}`,
        description: updatedSubmission.description,
        longDescription: updatedSubmission.description,
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        website: updatedSubmission.website,
        foundedYear: updatedSubmission.foundedYear || new Date().getFullYear(),
        type: updatedSubmission.type,
        stage: updatedSubmission.stage,
        areaId: updatedSubmission.areaId || 'area-sec-62',
        areaName: updatedSubmission.areaName || 'Sector 62, Noida',
        address: updatedSubmission.address || 'Noida, UP',
        latitude: 28.6280 + (Math.random() - 0.5) * 0.04,
        longitude: 77.3650 + (Math.random() - 0.5) * 0.04,
        employeeRange: updatedSubmission.employeeRange || '10-25',
        totalFunding: updatedSubmission.totalFunding || 'Undisclosed',
        fundingRounds: [],
        techStack: techStackArr,
        linkedin: updatedSubmission.website,
        verified: true,
        hiring: updatedSubmission.hiring,
        sectors: [updatedSubmission.sector],
        founders: [
          {
            id: `fnd-${Date.now()}`,
            name: updatedSubmission.founderName,
            slug: updatedSubmission.founderName.toLowerCase().replace(/\s+/g, '-'),
            role: updatedSubmission.founderRole,
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            linkedin: updatedSubmission.founderLinkedin,
          }
        ],
        jobsCount: updatedSubmission.hiring ? 1 : 0,
        viewsCount: 1,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      startupService.addStartup(newStartup);
    }

    return updatedSubmission;
  }
};
