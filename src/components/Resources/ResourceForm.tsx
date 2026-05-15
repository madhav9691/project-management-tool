import React, { useState, useEffect } from 'react';
import type { Resource } from '../../types';
import { cn } from '../../utils/cn';
import { getProjectsFromStorage } from '../../utils/storage';
import { X, Save, User, Mail, Briefcase, TrendingUp, Calendar, DollarSign, Zap, CheckCircle2 } from 'lucide-react';

interface ResourceFormProps {
  resource?: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Partial<Resource>) => void;
}

const departments = ['Web Development', 'Web Frontend', 'Web Backend', 'Android', 'iOS', 'Flutter/iOS', 'UI/UX', 'QA', 'Sales', 'Project Management'];

export const ResourceForm: React.FC<ResourceFormProps> = ({ resource, isOpen, onClose, onSave }) => {
  const [f, setF] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillsInput, setSkillsInput] = useState('');
  const [projectNames, setProjectNames] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    // Load projects to calculate occupancy context
    const projects = getProjectsFromStorage();

    if (resource) {
      // Find which projects this resource is assigned to
      const assigned = projects.filter(p =>
        p.assignedTeamMembers?.includes(resource.name) || p.primaryResources?.includes(resource.name)
      ).map(p => p.projectName);
      setProjectNames(assigned);

      setF({
        name: resource.name || '', email: resource.email || '', role: resource.role || 'developer',
        department: resource.department || 'Web Development', hourlyRate: resource.hourlyRate ?? 20,
        availability: resource.availability ?? 40, occupancyPercentage: resource.occupancyPercentage ?? 0,
        isActive: resource.isActive ?? true,
      });
      setSkillsInput(resource.skills?.join(', ') || '');
    } else {
      setProjectNames([]);
      setF({
        name: '', email: '', role: 'developer', department: 'Web Development',
        hourlyRate: 20, availability: 40, occupancyPercentage: 0, isActive: true,
      });
      setSkillsInput('');
    }
    setErrors({});
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const v = (k: string) => f[k] ?? '';
  const s = (k: string, val: any) => { setF(p => ({ ...p, [k]: val })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  const occupancy = parseInt(v('occupancyPercentage')) || 0;
  const occColor = occupancy >= 90 ? 'bg-red-500' : occupancy >= 70 ? 'bg-yellow-500' : 'bg-green-500';
  const occLabel = occupancy >= 90 ? 'Fully Occupied' : occupancy >= 70 ? 'Partially Busy' : occupancy >= 50 ? 'Moderately Busy' : occupancy > 0 ? 'Lightly Loaded' : 'Available';
  const occTextColor = occupancy >= 90 ? 'text-red-700' : occupancy >= 70 ? 'text-yellow-700' : 'text-green-700';
  const occBg = occupancy >= 90 ? 'bg-red-50 border-red-200' : occupancy >= 70 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v('name').trim()) errs.name = 'Name is required';
    if (!v('email').trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) errs.email = 'Invalid email format';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await onSave({
        name: v('name'), email: v('email'), role: v('role'), department: v('department'),
        skills: skillsInput.split(',').map((x: string) => x.trim()).filter(Boolean),
        hourlyRate: parseFloat(v('hourlyRate')) || 0, availability: parseInt(v('availability')) || 40,
        occupancyPercentage: parseInt(v('occupancyPercentage')) || 0,
        isActive: v('isActive'),
      });
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', resource ? 'bg-blue-100' : 'bg-green-100')}>
              <User className={cn('w-5 h-5', resource ? 'text-blue-600' : 'text-green-600')} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{resource ? 'Edit Resource' : 'Add New Resource'}</h3>
              {resource && <p className="text-sm text-gray-500">{resource.email}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Personal Info */}
          <section className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><User className="w-5 h-5 text-blue-600" /> Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={v('name')} onChange={e => s('name', e.target.value)}
                    className={cn('w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm', errors.name && 'border-red-500')}
                    placeholder="Enter full name" />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={v('email')} onChange={e => s('email', e.target.value)}
                    className={cn('w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm', errors.email && 'border-red-500')}
                    placeholder="name@krify.com" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={v('role')} onChange={e => s('role', e.target.value)} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="developer">Developer</option><option value="qa">QA Engineer</option>
                    <option value="team_lead">Team Lead</option><option value="project_manager">Project Manager</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={v('department')} onChange={e => s('department', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-green-50/60 border border-green-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Zap className="w-5 h-5 text-green-600" /> Skills & Expertise</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
              <input type="text" value={skillsInput} onChange={e => setSkillsInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="React, Node.js, TypeScript, Python, AWS" />
              {skillsInput && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skillsInput.split(',').map((sk: string) => sk.trim()).filter(Boolean).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{sk}</span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Billing & Availability */}
          <section className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><DollarSign className="w-5 h-5 text-purple-600" /> Billing & Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" value={v('hourlyRate')} onChange={e => s('hourlyRate', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability (hrs/week)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" max="60" value={v('availability')} onChange={e => s('availability', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={v('isActive')} onChange={e => s('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Active Resource</span>
                </label>
              </div>
            </div>
          </section>

          {/* Occupancy */}
          <section className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-orange-600" /> Occupancy & Allocation</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupancy Percentage (%)</label>
                <input type="range" min="0" max="100" step="5" value={occupancy}
                  onChange={e => s('occupancyPercentage', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">0% Available</span>
                  <input type="number" min="0" max="100" value={occupancy} onChange={e => s('occupancyPercentage', parseInt(e.target.value) || 0)}
                    className="w-16 text-center text-sm border border-gray-300 rounded-lg py-1 focus:ring-2 focus:ring-blue-500" />
                  <span className="text-xs text-gray-500">100% Occupied</span>
                </div>
                {/* Visual progress */}
                <div className="mt-3 h-4 bg-gray-200 rounded-full overflow-hidden relative">
                  <div className={cn('h-full rounded-full transition-all', occColor)} style={{ width: `${occupancy}%` }} />
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-800">{occupancy}%</span>
                </div>
              </div>

              <div className={cn('p-4 border rounded-lg', occBg)}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn('w-3 h-3 rounded-full', occColor)} />
                  <span className={cn('font-semibold text-sm', occTextColor)}>{occLabel}</span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• Occupancy: <strong>{occupancy}%</strong></p>
                  <p>• Free Capacity: <strong>{100 - occupancy}%</strong></p>
                  <p>• Weekly Available: <strong>{Math.round((parseInt(v('availability')) || 40) * (100 - occupancy) / 100)} hrs</strong></p>
                </div>
                {occupancy >= 90 && (
                  <p className="mt-2 text-xs text-red-600 font-medium">⚠ This resource is overloaded. Consider redistributing tasks.</p>
                )}
              </div>
            </div>

            {/* Current Project Assignments (shown when editing) */}
            {projectNames.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Currently Assigned To ({projectNames.length} projects)</label>
                <div className="flex flex-wrap gap-1.5">
                  {projectNames.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Occupancy Reference */}
          <section className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Occupancy Reference Guide</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1" />
                <p className="text-xs font-medium text-green-700">0% – 49%</p>
                <p className="text-[10px] text-green-600">Available</p>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-1" />
                <p className="text-xs font-medium text-yellow-700">50% – 69%</p>
                <p className="text-[10px] text-yellow-600">Moderately Busy</p>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-1" />
                <p className="text-xs font-medium text-orange-700">70% – 89%</p>
                <p className="text-[10px] text-orange-600">Partially Busy</p>
              </div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-1" />
                <p className="text-xs font-medium text-red-700">90% – 100%</p>
                <p className="text-[10px] text-red-600">Fully Occupied</p>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className={cn('flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow', isSubmitting && 'opacity-50 cursor-not-allowed')}>
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {resource ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
