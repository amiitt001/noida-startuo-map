import React, { useState, useEffect } from 'react';
import { Submission, Startup } from '../../types';
import { submissionService } from '../../services/submissionService';
import { startupService } from '../../services/startupService';
import { jobService } from '../../services/jobService';

interface AdminDashboardProps {
  onBack: () => void;
  onViewStartup: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onViewStartup }) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'startups' | 'jobs' | 'analytics'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    setSubmissions(submissionService.getAllSubmissions());
    setStartups(startupService.getAllStartups());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, status: Submission['status']) => {
    submissionService.updateStatus(id, status);
    loadData();
    setSelectedSub(null);
    setActionSuccess(`Submission status updated to "${status.toUpperCase()}". ${status === 'approved' ? 'Company published to live Atlas!' : ''}`);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const handleToggleVerify = (startup: Startup) => {
    const updated = { ...startup, verified: !startup.verified };
    startupService.updateStartup(updated);
    loadData();
    setActionSuccess(`${startup.name} is now ${updated.verified ? 'Verified' : 'Unverified'}.`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleDeleteStartup = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the Atlas?`)) {
      startupService.deleteStartup(id);
      loadData();
      setActionSuccess(`${name} removed.`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#545f72] mb-1">
            <button onClick={onBack} className="flex items-center gap-1 hover:text-[#030612]">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Public Atlas</span>
            </button>
            <span>/</span>
            <span className="text-[#FF6B35] font-bold">Admin Console</span>
          </div>
          <h1 className="font-h1 text-2xl md:text-3xl font-extrabold text-[#030612] flex items-center gap-2">
            <span>Ecosystem Verification & Editorial Console</span>
            <span className="bg-[#1a1f2c] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
              Admin Mode
            </span>
          </h1>
        </div>

        {/* Action Flash */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-in fade-in">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{actionSuccess}</span>
          </div>
        )}
      </div>

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-[#c6c6cc]/40 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#1a1f2c] text-white'
              : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
          }`}
        >
          <span className="material-symbols-outlined text-base">fact_check</span>
          <span>Pending Submissions</span>
          <span className="bg-[#FF6B35] text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
            {submissions.filter(s => s.status === 'pending' || s.status === 'in_review').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('startups')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'startups'
              ? 'bg-[#1a1f2c] text-white'
              : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
          }`}
        >
          <span className="material-symbols-outlined text-base">rocket_launch</span>
          <span>Published Startups ({startups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-[#1a1f2c] text-white'
              : 'bg-[#f6f3f4] text-[#45464c] hover:bg-[#eae7e8]'
          }`}
        >
          <span className="material-symbols-outlined text-base">work</span>
          <span>Job Listings Moderation</span>
        </button>
      </div>

      {/* TAB 1: Submissions Workflow Review */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm">
            <h3 className="font-h3 text-lg font-bold text-[#030612] mb-1">
              Community Submissions Pipeline
            </h3>
            <p className="text-xs text-[#545f72] mb-6">
              Review startups submitted by founders and ecosystem builders. Approving a submission automatically provisions it to the interactive map.
            </p>

            {submissions.length === 0 ? (
              <p className="text-sm text-[#545f72] py-8 text-center">No submissions received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#c6c6cc]/40 text-[#545f72] font-semibold">
                      <th className="pb-3">Company</th>
                      <th className="pb-3">Sector & Stage</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Founder</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c6c6cc]/30">
                    {submissions.map((sub) => {
                      const statusColor =
                        sub.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sub.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : sub.status === 'in_review'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200';

                      return (
                        <tr key={sub.id} className="py-3 hover:bg-[#f6f3f4]/50 transition-colors">
                          <td className="py-3">
                            <span className="font-bold text-[#030612] block">{sub.companyName}</span>
                            <span className="text-[11px] text-[#545f72] truncate max-w-[200px] block">
                              {sub.website}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-[#1c1b1c]">{sub.sector}</span>
                            <span className="text-[#545f72] block">{sub.stage}</span>
                          </td>
                          <td className="py-3 text-[#545f72]">{sub.areaName}</td>
                          <td className="py-3">
                            <span className="font-semibold text-[#030612] block">{sub.founderName}</span>
                            <span className="text-[#545f72]">{sub.founderEmail}</span>
                          </td>
                          <td className="py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColor}`}>
                              {sub.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedSub(sub)}
                              className="px-2.5 py-1 bg-[#f0edee] hover:bg-[#eae7e8] text-[#030612] font-semibold rounded-lg"
                            >
                              Review Details
                            </button>
                            {sub.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(sub.id, 'approved')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                              >
                                Approve & Publish
                              </button>
                            )}
                            {sub.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdateStatus(sub.id, 'rejected')}
                                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detailed Review Dialog */}
          {selectedSub && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-white rounded-2xl border border-[#c6c6cc] p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-start border-b border-[#c6c6cc]/40 pb-3">
                  <div>
                    <h3 className="font-h3 text-lg font-bold text-[#030612]">
                      {selectedSub.companyName}
                    </h3>
                    <p className="text-xs text-[#545f72]">{selectedSub.tagline}</p>
                  </div>
                  <button onClick={() => setSelectedSub(null)} className="p-1 text-[#76777c]">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-[#545f72] block">Description:</span>
                    <p className="text-[#1c1b1c] mt-0.5">{selectedSub.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-[#f6f3f4] p-3 rounded-xl">
                    <div>
                      <span className="font-semibold text-[#545f72]">Sector:</span> {selectedSub.sector}
                    </div>
                    <div>
                      <span className="font-semibold text-[#545f72]">Stage:</span> {selectedSub.stage}
                    </div>
                    <div>
                      <span className="font-semibold text-[#545f72]">Team:</span> {selectedSub.employeeRange}
                    </div>
                    <div>
                      <span className="font-semibold text-[#545f72]">Funding:</span> {selectedSub.totalFunding}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-[#545f72] block">Founder Contact:</span>
                    <p className="text-[#030612] font-semibold">{selectedSub.founderName} ({selectedSub.founderRole})</p>
                    <p className="text-[#545f72]">{selectedSub.founderEmail} • {selectedSub.founderLinkedin}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#c6c6cc]/40">
                  <button
                    onClick={() => handleUpdateStatus(selectedSub.id, 'rejected')}
                    className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSub.id, 'approved')}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
                  >
                    Approve & Publish to Atlas
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Published Startups Management */}
      {activeTab === 'startups' && (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-h3 text-lg font-bold text-[#030612]">Manage Published Startups</h3>
              <p className="text-xs text-[#545f72]">Control verification badges, hiring statuses, or delete records.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#c6c6cc]/40 text-[#545f72] font-semibold">
                  <th className="pb-3">Company</th>
                  <th className="pb-3">Sector</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Verification</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cc]/30">
                {startups.map((s) => (
                  <tr key={s.id} className="py-2.5 hover:bg-[#f6f3f4]/50">
                    <td className="py-2.5 font-bold text-[#030612] flex items-center gap-2">
                      <img src={s.logo} alt="" className="w-6 h-6 rounded object-cover" />
                      <span>{s.name}</span>
                    </td>
                    <td className="py-2.5 text-[#545f72]">{s.sectors.join(', ')}</td>
                    <td className="py-2.5 font-medium text-[#1c1b1c]">{s.stage}</td>
                    <td className="py-2.5 text-[#545f72]">{s.areaName}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${s.verified ? 'text-[#FF6B35]' : 'text-[#76777c]'}`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {s.verified ? 'verified' : 'cancel'}
                        </span>
                        {s.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        onClick={() => onViewStartup(s.slug)}
                        className="px-2 py-1 bg-[#f0edee] text-[#1c1b1c] rounded font-semibold hover:bg-[#eae7e8]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleToggleVerify(s)}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-semibold hover:bg-blue-100"
                      >
                        {s.verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button
                        onClick={() => handleDeleteStartup(s.id, s.name)}
                        className="px-2 py-1 bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Job Listings Moderation */}
      {activeTab === 'jobs' && (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-h3 text-lg font-bold text-[#030612]">Startup Job Listings</h3>
          <p className="text-xs text-[#545f72]">Currently active openings published across Noida startups.</p>

          <div className="divide-y divide-[#c6c6cc]/30">
            {jobService.getAllJobs().map((job) => (
              <div key={job.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#030612]">{job.title}</h4>
                  <p className="text-xs text-[#545f72]">{job.startupName} • {job.location} ({job.workMode}) • {job.salaryRange}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                  Live on Portal
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
