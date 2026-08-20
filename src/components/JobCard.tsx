import React, { useState } from 'react';
import { Job } from '../types';
import { useSaved } from '../hooks/useSaved';

interface JobCardProps {
  job: Job;
  onSelectStartup?: (startupSlug: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelectStartup }) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('job', job.id);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantResume, setApplicantResume] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setApplied(false);
    }, 2000);
  };

  return (
    <>
      <div className="bg-white border border-[#c6c6cc]/70 rounded-xl p-5 hover:border-[#030612] hover:shadow-md transition-all flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <img
                src={job.startupLogo}
                alt={job.startupName}
                className="w-11 h-11 rounded-lg bg-[#eae7e8] object-cover border border-[#c6c6cc]/40"
              />
              <div>
                <h3 className="font-h3 text-base font-bold text-[#030612] group-hover:text-[#FF6B35] transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="font-body-md text-xs text-[#545f72]">
                  by{' '}
                  <span
                    onClick={() => onSelectStartup && onSelectStartup(job.startupSlug)}
                    className="font-bold text-[#030612] hover:underline hover:text-[#FF6B35] cursor-pointer"
                  >
                    {job.startupName}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleSave('job', job.id)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                saved ? 'text-[#FF6B35] bg-[#FF6B35]/10' : 'text-[#c6c6cc] hover:text-[#030612]'
              }`}
              title="Save Job"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>

          <p className="text-xs text-[#45464c] line-clamp-2 mb-4 leading-relaxed">
            {job.description}
          </p>

          {/* Quick info tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-[#f0edee] text-[#1c1b1c] text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              {job.salaryRange}
            </span>
            <span className="bg-[#f0edee] text-[#545f72] text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {job.location} ({job.workMode})
            </span>
            <span className="bg-[#f0edee] text-[#545f72] text-xs font-medium px-2.5 py-1 rounded-md">
              {job.experience}
            </span>
            {job.isFresherFriendly && (
              <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-md">
                Fresher Friendly
              </span>
            )}
          </div>

          {/* Skills required */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {job.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] bg-[#1a1f2c]/5 text-[#45464c] font-medium px-2 py-0.5 rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer with Apply CTA */}
        <div className="flex items-center justify-between border-t border-[#c6c6cc]/40 pt-3">
          <span className="text-[11px] text-[#76777c] font-medium">
            Posted {job.postedDate}
          </span>
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2 bg-[#1a1f2c] text-white text-xs font-semibold rounded-lg hover:bg-[#FF6B35] transition-colors shadow-sm cursor-pointer flex items-center gap-1"
          >
            <span>Apply Now</span>
            <span className="material-symbols-outlined text-[14px]">send</span>
          </button>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#c6c6cc] p-6 shadow-2xl relative">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-[#76777c] hover:text-[#030612]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="mb-4">
              <span className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wider">
                Direct Application
              </span>
              <h3 className="font-h3 text-lg font-bold text-[#030612] mt-1">
                Apply for {job.title}
              </h3>
              <p className="text-xs text-[#545f72]">{job.startupName} • {job.location}</p>
            </div>

            {applied ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
                <h4 className="font-bold text-base text-[#030612]">Application Dispatched!</h4>
                <p className="text-xs text-[#545f72]">
                  Your application profile was sent directly to {job.contactEmail}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rathore"
                    className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="e.g. vikram@example.com"
                    className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Portfolio / LinkedIn / Resume Link</label>
                  <input
                    type="url"
                    required
                    value={applicantResume}
                    onChange={(e) => setApplicantResume(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#FF6B35] text-white text-sm font-semibold rounded-xl hover:bg-[#e05a26] transition-colors shadow"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
