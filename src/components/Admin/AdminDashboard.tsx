import React, { useState, useEffect, useCallback } from 'react';
import { Submission, Startup } from '../../types';
import { submissionService } from '../../services/submissionService';
import { startupService } from '../../services/startupService';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
  onBack: () => void;
  onViewStartup: (slug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onViewStartup }) => {
  const { isAuthenticated, isAdmin, isLoading: authLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'startups' | 'jobs' | 'analytics'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick inline login form state for unauthenticated admin view
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setLoading(true);
    try {
      const [subs, stps] = await Promise.all([
        submissionService.getSubmissions().catch(() => []),
        startupService.getAllStartups().catch(() => []),
      ]);
      setSubmissions(subs);
      setStartups(stps);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: Submission['status']) => {
    try {
      await submissionService.updateStatus(id, status);
      await loadData();
      setSelectedSub(null);
      setActionSuccess(`Submission status updated to "${status.toUpperCase()}". ${status === 'approved' ? 'Company published to live Atlas!' : ''}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleToggleVerify = async (startup: Startup) => {
    try {
      const updated = await startupService.toggleVerified(startup.id);
      await loadData();
      setActionSuccess(`${startup.name} is now ${updated.verified ? 'Verified' : 'Unverified'}.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update startup');
    }
  };

  const handleDeleteStartup = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from the Atlas?`)) {
      try {
        await startupService.deleteStartup(id);
        await loadData();
        setActionSuccess(`${name} removed.`);
        setTimeout(() => setActionSuccess(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Failed to delete startup');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-16 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="w-full max-w-[480px] mx-auto px-4 py-16 space-y-6">
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <h2 className="text-xl font-bold text-[#030612]">Admin Authentication Required</h2>
          <p className="text-xs text-[#545f72]">
            You must be logged in with an administrator account to access the Atlas Admin Console.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left pt-2">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@noidaatlas.dev"
                className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 bg-[#FF6B35] text-white text-xs font-bold rounded-lg hover:bg-[#e85a24] transition-colors disabled:opacity-50"
            >
              {loggingIn ? 'Authenticating...' : 'Log In to Admin Console'}
            </button>
          </form>

          <div className="pt-2">
            <button onClick={onBack} className="text-xs font-semibold text-[#545f72] hover:text-[#030612]">
              ← Back to Main Atlas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#545f72] mb-1">
            <button onClick={onBack} className="flex items-center gap-1 hover:text-[#030612]">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Map</span>
            </button>
            <span>/</span>
            <span className="text-[#030612]">Admin Console</span>
          </div>
          <h1 className="font-h2 text-2xl font-bold text-[#030612] flex items-center gap-2">
            Atlas Admin Console
            <span className="px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] text-xs rounded-md">Server Authenticated</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="px-3 py-1.5 border border-[#c6c6cc] text-xs font-semibold rounded-lg hover:bg-gray-50 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-green-50 text-green-700 text-xs rounded-xl border border-green-200 flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center border-b border-[#c6c6cc]/70 gap-6">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'border-[#FF6B35] text-[#FF6B35]'
              : 'border-transparent text-[#545f72] hover:text-[#030612]'
          }`}
        >
          <span>Submissions Queue</span>
          {submissions.filter((s) => s.status === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px]">
              {submissions.filter((s) => s.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('startups')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'startups'
              ? 'border-[#FF6B35] text-[#FF6B35]'
              : 'border-transparent text-[#545f72] hover:text-[#030612]'
          }`}
        >
          <span>Active Startups</span>
          <span className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded-full text-[10px]">
            {startups.length}
          </span>
        </button>
      </div>

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submissions List */}
            <div className="lg:col-span-1 bg-white border border-[#c6c6cc]/70 rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-[#545f72] uppercase tracking-wider">Queue ({submissions.length})</h3>
              {loading ? (
                <div className="py-8 text-center text-xs text-gray-500">Loading queue...</div>
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">No submissions in queue.</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {submissions.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        selectedSub?.id === sub.id
                          ? 'border-[#FF6B35] bg-[#FF6B35]/5 shadow-xs'
                          : 'border-[#c6c6cc]/60 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-[#030612] truncate">{sub.companyName}</span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${
                            sub.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : sub.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#545f72] line-clamp-1">{sub.tagline}</p>
                      <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-between">
                        <span>{sub.areaName}</span>
                        <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Detail View */}
            <div className="lg:col-span-2 bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm">
              {selectedSub ? (
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-[#030612]">{selectedSub.companyName}</h2>
                      <p className="text-xs text-[#545f72]">{selectedSub.tagline}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSub.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedSub.id, 'approved')}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Approve & Publish</span>
                        </button>
                      )}
                      {selectedSub.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedSub.id, 'rejected')}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">cancel</span>
                          <span>Reject</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-500">Website:</span>{' '}
                      <a href={selectedSub.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {selectedSub.website}
                      </a>
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Founded Year:</span> {selectedSub.foundedYear}
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Sector:</span> {selectedSub.sector}
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Area:</span> {selectedSub.areaName}
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Founder:</span> {selectedSub.founderName} ({selectedSub.founderRole})
                    </div>
                    <div>
                      <span className="font-bold text-gray-500">Founder Email:</span> {selectedSub.founderEmail}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 mb-1">Description</h4>
                    <p className="text-xs text-[#030612] leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {selectedSub.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-xs text-gray-400">
                  Select a submission from the queue to view details and approve.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Startups Tab */}
      {activeTab === 'startups' && (
        <div className="bg-white border border-[#c6c6cc]/70 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#030612]">Live Directory Startups ({startups.length})</h3>
          <div className="divide-y divide-gray-100">
            {startups.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img src={s.logo} alt={s.name} className="w-8 h-8 rounded-lg object-cover border" />
                  <div>
                    <span className="font-bold text-[#030612]">{s.name}</span>
                    <span className="text-gray-400 ml-2">({s.areaName})</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleVerify(s)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                      s.verified
                        ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                        : 'border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {s.verified ? '✓ Verified' : 'Verify'}
                  </button>
                  <button
                    onClick={() => onViewStartup(s.slug)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteStartup(s.id, s.name)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
