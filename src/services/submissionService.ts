/**
 * Submission Service
 *
 * Frontend service calling backend /api/submissions and /api/admin/submissions.
 */

import { apiClient } from './apiClient';
import { Submission, SubmissionFormData } from '../types';

export const submissionService = {
  async getSubmissions(): Promise<Submission[]> {
    const res = await apiClient.get<Submission[]>('/api/admin/submissions');
    return res.data;
  },

  async addSubmission(formData: SubmissionFormData): Promise<Submission> {
    const res = await apiClient.post<Submission>('/api/submissions', formData);
    return res.data;
  },

  async updateStatus(
    id: string,
    status: Submission['status'],
    notes?: string,
    coords?: { latitude?: number; longitude?: number }
  ): Promise<Submission> {
    const res = await apiClient.patch<Submission>(`/api/admin/submissions/${id}/status`, {
      status,
      notes,
      latitude: coords?.latitude,
      longitude: coords?.longitude,
    });
    return res.data;
  },
};
