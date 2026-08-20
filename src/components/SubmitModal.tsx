import React, { useState } from 'react';
import { z } from 'zod';
import { submissionService } from '../services/submissionService';
import { StartupType, StartupStage, SectorType } from '../types';
import { SEED_AREAS } from '../data/seedData';

interface SubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

// Zod schemas per step
const Step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  tagline: z.string().min(6, 'Tagline must be at least 6 characters'),
  website: z.string().url('Must be a valid URL (e.g. https://mycompany.com)'),
  foundedYear: z.number().min(2000, 'Year must be 2000 or later').max(2026, 'Year cannot exceed current year'),
});

const Step2Schema = z.object({
  areaId: z.string().min(1, 'Please select a Noida/Greater Noida area'),
  address: z.string().min(5, 'Specific office address or tech park name is required'),
});

const Step3Schema = z.object({
  type: z.enum(['Startup', 'Scale-up', 'Unicorn', 'Bootstrapped', 'Public']),
  stage: z.enum(['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth']),
  sector: z.string().min(1, 'Please select primary sector'),
});

const Step4Schema = z.object({
  founderName: z.string().min(2, 'Founder name is required'),
  founderRole: z.string().min(2, 'Founder role/title is required'),
  founderEmail: z.string().email('Please enter a valid work email address'),
  founderLinkedin: z.string().url('Please provide a valid LinkedIn URL'),
});

const Step5Schema = z.object({
  description: z.string().min(20, 'Please provide at least 20 characters describing what your company builds'),
  employeeRange: z.string().min(1, 'Please select employee count'),
  totalFunding: z.string().min(1, 'Please select or disclose funding level'),
  techStack: z.string().min(2, 'List primary tech stack (e.g. Python, React, PyTorch)'),
  hiring: z.boolean(),
});

export const SubmitModal: React.FC<SubmitModalProps> = ({ isOpen, onClose, onSubmitted }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    companyName: '',
    tagline: '',
    website: '',
    foundedYear: 2024,
    areaId: 'area-sec-62',
    address: '',
    type: 'Startup' as StartupType,
    stage: 'Seed' as StartupStage,
    sector: 'AI / ML' as SectorType,
    founderName: '',
    founderRole: 'Founder & CEO',
    founderEmail: '',
    founderLinkedin: '',
    description: '',
    employeeRange: '10-25',
    totalFunding: '$1.0M',
    techStack: 'React, TypeScript, Python',
    hiring: true,
  });

  if (!isOpen) return null;

  const validateCurrentStep = (): boolean => {
    try {
      setErrors({});
      if (step === 1) {
        Step1Schema.parse({
          companyName: formData.companyName,
          tagline: formData.tagline,
          website: formData.website,
          foundedYear: Number(formData.foundedYear),
        });
      } else if (step === 2) {
        Step2Schema.parse({
          areaId: formData.areaId,
          address: formData.address,
        });
      } else if (step === 3) {
        Step3Schema.parse({
          type: formData.type,
          stage: formData.stage,
          sector: formData.sector,
        });
      } else if (step === 4) {
        Step4Schema.parse({
          founderName: formData.founderName,
          founderRole: formData.founderRole,
          founderEmail: formData.founderEmail,
          founderLinkedin: formData.founderLinkedin,
        });
      } else if (step === 5) {
        Step5Schema.parse({
          description: formData.description,
          employeeRange: formData.employeeRange,
          totalFunding: formData.totalFunding,
          techStack: formData.techStack,
          hiring: formData.hiring,
        });
      }
      return true;
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((e: z.ZodIssue) => {
          if (e.path[0]) {
            fieldErrors[String(e.path[0])] = e.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = () => {
    const selectedAreaObj = SEED_AREAS.find((a) => a.id === formData.areaId);
    const areaName = selectedAreaObj ? `${selectedAreaObj.name}, ${selectedAreaObj.city}` : 'Sector 62, Noida';

    submissionService.createSubmission({
      ...formData,
      areaName,
      foundedYear: Number(formData.foundedYear),
    });

    setIsSuccess(true);
    if (onSubmitted) onSubmitted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#c6c6cc] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c6c6cc]/50 flex items-center justify-between bg-[#fcf8f9]">
          <div>
            <span className="font-label-caps text-[11px] text-[#FF6B35] uppercase tracking-wider font-bold">
              Join Ecosystem
            </span>
            <h3 className="font-h3 text-xl font-bold text-[#030612]">
              Submit Your Startup to the Atlas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#76777c] hover:text-[#030612] p-1.5 rounded-full hover:bg-[#eae7e8]"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Multi-step progress bar */}
        {!isSuccess && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-[#545f72] mb-2">
              <span>Step {step} of 6: {['Company Info', 'Location', 'Classification', 'Founders', 'Details', 'Review'][step - 1]}</span>
              <span>{Math.round((step / 6) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#eae7e8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#FF6B35] transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {isSuccess ? (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">verified</span>
              </div>
              <h3 className="font-h2 text-2xl font-bold text-[#030612]">
                Startup submitted for verification!
              </h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Status: Pending Editorial Review
              </div>
              <p className="font-body-md text-sm text-[#545f72] max-w-md mt-1">
                Thank you for contributing to the Noida Startup Atlas. Our ecosystem curators will verify your submission and publish it to the interactive map within 24 hours.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setStep(1);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 bg-[#1a1f2c] text-white text-sm font-semibold rounded-xl hover:bg-[#030612]"
              >
                Back to Atlas
              </button>
            </div>
          ) : (
            <>
              {/* STEP 1: Company Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="font-h3 text-base font-bold text-[#030612]">Company Overview</h4>
                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Company / Startup Name *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Acme AI Technologies"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.companyName ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Tagline (One sentence) *</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Autonomous AI infrastructure for enterprise engineering teams"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.tagline ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.tagline && <p className="text-xs text-red-600 mt-1">{errors.tagline}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Website URL *</label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.website ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                      />
                      {errors.website && <p className="text-xs text-red-600 mt-1">{errors.website}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Founded Year *</label>
                      <input
                        type="number"
                        value={formData.foundedYear}
                        onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) || 2024 })}
                        min="2000"
                        max="2026"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.foundedYear ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                      />
                      {errors.foundedYear && <p className="text-xs text-red-600 mt-1">{errors.foundedYear}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="font-h3 text-base font-bold text-[#030612]">Noida / Greater Noida Location</h4>
                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Ecosystem Area / Cluster *</label>
                    <select
                      value={formData.areaId}
                      onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                    >
                      {SEED_AREAS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Office / Tech Park Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Tower 3, Candor TechSpace SEZ, Sector 135"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.address ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>
                </div>
              )}

              {/* STEP 3: Classification */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-h3 text-base font-bold text-[#030612]">Classification & Sector</h4>
                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Primary Sector *</label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value as SectorType })}
                      className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                    >
                      {[
                        'AI / ML', 'SaaS', 'FinTech', 'EdTech', 'HealthTech', 'Cybersecurity',
                        'DeepTech', 'EV', 'ClimateTech', 'AgriTech', 'E-commerce', 'D2C',
                        'Logistics', 'PropTech', 'Gaming', 'Web3', 'Robotics', 'IoT'
                      ].map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Company Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as StartupType })}
                        className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                      >
                        <option value="Startup">Startup</option>
                        <option value="Scale-up">Scale-up</option>
                        <option value="Bootstrapped">Bootstrapped</option>
                        <option value="Unicorn">Unicorn</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Current Funding Stage *</label>
                      <select
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value as StartupStage })}
                        className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                      >
                        <option value="Idea">Idea</option>
                        <option value="Pre-seed">Pre-seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
                        <option value="Growth">Growth</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Founder Information */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="font-h3 text-base font-bold text-[#030612]">Lead Founder Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Founder Full Name *</label>
                      <input
                        type="text"
                        value={formData.founderName}
                        onChange={(e) => setFormData({ ...formData, founderName: e.target.value })}
                        placeholder="e.g. Neha Gupta"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.founderName ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                      />
                      {errors.founderName && <p className="text-xs text-red-600 mt-1">{errors.founderName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Role / Designation *</label>
                      <input
                        type="text"
                        value={formData.founderRole}
                        onChange={(e) => setFormData({ ...formData, founderRole: e.target.value })}
                        placeholder="e.g. Co-founder & CEO"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.founderRole ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                      />
                      {errors.founderRole && <p className="text-xs text-red-600 mt-1">{errors.founderRole}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Work Email (for verification) *</label>
                    <input
                      type="email"
                      value={formData.founderEmail}
                      onChange={(e) => setFormData({ ...formData, founderEmail: e.target.value })}
                      placeholder="neha@company.com"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.founderEmail ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.founderEmail && <p className="text-xs text-red-600 mt-1">{errors.founderEmail}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Founder LinkedIn Profile *</label>
                    <input
                      type="url"
                      value={formData.founderLinkedin}
                      onChange={(e) => setFormData({ ...formData, founderLinkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.founderLinkedin ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.founderLinkedin && <p className="text-xs text-red-600 mt-1">{errors.founderLinkedin}</p>}
                  </div>
                </div>
              )}

              {/* STEP 5: Additional Information */}
              {step === 5 && (
                <div className="space-y-4">
                  <h4 className="font-h3 text-base font-bold text-[#030612]">Ecosystem & Technical Details</h4>
                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Company Description *</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe what product or technology you build, who your customers are, and your mission in Noida..."
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.description ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Team Size *</label>
                      <select
                        value={formData.employeeRange}
                        onChange={(e) => setFormData({ ...formData, employeeRange: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                      >
                        <option value="1-10">1-10 Employees</option>
                        <option value="10-25">10-25 Employees</option>
                        <option value="25-50">25-50 Employees</option>
                        <option value="50-100">50-100 Employees</option>
                        <option value="100-250">100-250 Employees</option>
                        <option value="250+">250+ Employees</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Total Capital Raised *</label>
                      <select
                        value={formData.totalFunding}
                        onChange={(e) => setFormData({ ...formData, totalFunding: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[#c6c6cc] rounded-lg focus:border-[#FF6B35] focus:outline-none"
                      >
                        <option value="Bootstrapped">Bootstrapped / $0</option>
                        <option value="Under $500K">Under $500K</option>
                        <option value="$500K - $2M">$500K - $2M</option>
                        <option value="$2M - $10M">$2M - $10M</option>
                        <option value="$10M+">$10M+</option>
                        <option value="Undisclosed">Undisclosed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1c1b1c] mb-1">Primary Tech Stack *</label>
                    <input
                      type="text"
                      value={formData.techStack}
                      onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                      placeholder="e.g. Python, PyTorch, Next.js, Rust, AWS"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none ${errors.techStack ? 'border-red-500 bg-red-50/20' : 'border-[#c6c6cc] focus:border-[#FF6B35]'}`}
                    />
                    {errors.techStack && <p className="text-xs text-red-600 mt-1">{errors.techStack}</p>}
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1c1b1c] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hiring}
                        onChange={(e) => setFormData({ ...formData, hiring: e.target.checked })}
                        className="w-4 h-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      Is your team currently actively hiring in Noida?
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 6: Review */}
              {step === 6 && (
                <div className="space-y-4">
                  <h4 className="font-h3 text-base font-bold text-[#030612]">Review Your Submission</h4>
                  <div className="bg-[#f6f3f4] rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex justify-between border-b border-[#c6c6cc]/40 pb-2">
                      <span className="text-[#545f72] font-semibold">Startup:</span>
                      <span className="font-bold text-[#030612]">{formData.companyName} ({formData.foundedYear})</span>
                    </div>
                    <div className="flex justify-between border-b border-[#c6c6cc]/40 pb-2">
                      <span className="text-[#545f72] font-semibold">Tagline:</span>
                      <span className="font-medium text-[#030612] text-right max-w-xs">{formData.tagline}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#c6c6cc]/40 pb-2">
                      <span className="text-[#545f72] font-semibold">Sector & Stage:</span>
                      <span className="font-medium text-[#030612]">{formData.sector} • {formData.stage} • {formData.type}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#c6c6cc]/40 pb-2">
                      <span className="text-[#545f72] font-semibold">Location:</span>
                      <span className="font-medium text-[#030612]">{formData.address}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#c6c6cc]/40 pb-2">
                      <span className="text-[#545f72] font-semibold">Founder:</span>
                      <span className="font-medium text-[#030612]">{formData.founderName} ({formData.founderRole})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#545f72] font-semibold">Hiring Status:</span>
                      <span className="font-bold text-[#FF6B35]">{formData.hiring ? 'Active Hiring' : 'Not Hiring'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isSuccess && (
          <div className="px-6 py-4 border-t border-[#c6c6cc]/50 flex items-center justify-between bg-[#fcf8f9]">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm font-semibold text-[#45464c] hover:bg-[#eae7e8] rounded-xl transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-[#1a1f2c] text-white text-sm font-semibold rounded-xl hover:bg-[#030612] transition-colors shadow flex items-center gap-1"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-[#FF6B35] text-white text-sm font-bold rounded-xl hover:bg-[#e05a26] transition-colors shadow"
              >
                Confirm & Submit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
