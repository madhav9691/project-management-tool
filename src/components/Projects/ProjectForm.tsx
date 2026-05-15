import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatters';
import { mockUsers } from '../../data/mockData';
import { X, Save, User, Mail, Phone, Building2, Calendar, Globe, Smartphone, Monitor, Link as LinkIcon, Users, AlertCircle } from 'lucide-react';

interface ProjectFormProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, isOpen, onClose, onSave }) => {
  const [f, setF] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [primaryRes, setPrimaryRes] = useState<string[]>([]);
  const [plat, setPlat] = useState({ android: false, ios: false, webFe: false, webBe: false });

  useEffect(() => {
    if (!isOpen) return;
    if (project) {
      setF({
        projectNumber: project.projectNumber || '', projectName: project.projectName || '',
        projectType: project.projectType || 'running', clientName: project.clientName || '',
        clientEmail: project.clientEmail || '', clientPhone: project.clientPhone || '',
        clientCompany: project.clientCompany || '', country: project.country || '',
        salesCoordinator: project.salesCoordinator || '', projectManager: project.projectManager || 'Madhav',
        completionPercentage: project.completionPercentage ?? 0, currentPhase: project.currentPhase || 'UI',
        status: project.status || 'Active', priority: project.priority || 'Medium',
        startDate: project.startDate ? formatDate(project.startDate, 'yyyy-MM-dd') : '',
        plannedClosureDate: project.plannedClosureDate ? formatDate(project.plannedClosureDate, 'yyyy-MM-dd') : '',
        actualClosureDate: project.actualClosureDate ? formatDate(project.actualClosureDate, 'yyyy-MM-dd') : '',
        currentWeekUpdates: project.currentWeekUpdates || '', nextWeekTarget: project.nextWeekTarget || '',
        risks: (project.risks || []).join(', '), escalations: (project.escalations || []).join(', '),
        projectTrackerLink: project.projectTrackerLink || '', figmaLink: project.figmaLink || '',
        gitRepository: project.gitRepository || '', serverDetails: project.serverDetails || '',
        hostingDetails: project.hostingDetails || '', remarks: project.remarks || ''
      });
      setTeamMembers(project.assignedTeamMembers || []);
      setPrimaryRes(project.primaryResources || []);
      setPlat({ android: project.platforms?.android || false, ios: project.platforms?.ios || false, webFe: project.platforms?.webFrontend || false, webBe: project.platforms?.webBackend || false });
    } else {
      const r = Math.floor(1000 + Math.random() * 9000);
      setF({
        projectNumber: `P${new Date().getFullYear()}-${r}`, projectName: '', projectType: 'running',
        clientName: '', clientEmail: '', clientPhone: '', clientCompany: '', country: '',
        salesCoordinator: '', projectManager: 'Madhav', completionPercentage: 0, currentPhase: 'UI',
        status: 'Active', priority: 'Medium', startDate: formatDate(new Date(), 'yyyy-MM-dd'),
        plannedClosureDate: '', actualClosureDate: '', currentWeekUpdates: '', nextWeekTarget: '',
        risks: '', escalations: '', projectTrackerLink: '', figmaLink: '', gitRepository: '',
        serverDetails: '', hostingDetails: '', remarks: ''
      });
      setTeamMembers([]); setPrimaryRes([]);
      setPlat({ android: false, ios: false, webFe: false, webBe: false });
    }
    setErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const allTeam = mockUsers.filter(u => ['developer', 'qa', 'team_lead'].includes(u.role) && u.isActive);
  const v = (k: string) => f[k] ?? '';
  const s = (k: string, val: any) => { setF(p => ({ ...p, [k]: val })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v('projectName').trim()) errs.projectName = 'Project name is required';
    if (!v('clientName').trim()) errs.clientName = 'Client name is required';
    if (!v('clientEmail').trim()) errs.clientEmail = 'Client email is required';
    if (!v('projectManager')) errs.projectManager = 'Project manager is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      const d: Partial<Project> = {
        projectNumber: v('projectNumber'), projectName: v('projectName'), projectType: v('projectType'),
        clientName: v('clientName'), clientEmail: v('clientEmail'), clientPhone: v('clientPhone'),
        clientCompany: v('clientCompany'), country: v('country'), salesCoordinator: v('salesCoordinator'),
        projectManager: v('projectManager'), assignedTeamMembers: teamMembers, primaryResources: primaryRes,
        platforms: { android: plat.android, ios: plat.ios, webFrontend: plat.webFe, webBackend: plat.webBe },
        startDate: v('startDate') ? new Date(v('startDate')) : new Date(),
        plannedClosureDate: v('plannedClosureDate') ? new Date(v('plannedClosureDate')) : new Date(),
        actualClosureDate: v('actualClosureDate') ? new Date(v('actualClosureDate')) : undefined,
        completionPercentage: parseInt(v('completionPercentage')) || 0, currentPhase: v('currentPhase'),
        currentWeekUpdates: v('currentWeekUpdates'), nextWeekTarget: v('nextWeekTarget'),
        risks: v('risks').split(',').map((x: string) => x.trim()).filter(Boolean),
        escalations: v('escalations').split(',').map((x: string) => x.trim()).filter(Boolean),
        projectTrackerLink: v('projectTrackerLink'), figmaLink: v('figmaLink'), gitRepository: v('gitRepository'),
        serverDetails: v('serverDetails'), hostingDetails: v('hostingDetails'), priority: v('priority'),
        remarks: v('remarks'), status: v('status')
      };
      await onSave(d);
    } finally { setIsSubmitting(false); }
  };

  const inp = (label: string, field: string, opts?: { required?: boolean; type?: string; placeholder?: string; icon?: any; readOnly?: boolean }) => {
    const Icon = opts?.icon;
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{opts?.required && <span className="text-red-500"> *</span>}</label>
        <div className="relative">
          {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
          <input type={opts?.type || 'text'} value={v(field)} onChange={e => s(field, e.target.value)} readOnly={opts?.readOnly}
            className={cn('w-full py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm', Icon ? 'pl-9 pr-3' : 'px-3', errors[field] && 'border-red-500', opts?.readOnly && 'bg-gray-100 cursor-not-allowed')}
            placeholder={opts?.placeholder || ''} />
        </div>
        {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
      </div>
    );
  };

  const sel = (label: string, field: string, options: { value: string; label: string }[], required?: boolean) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <select value={v(field)} onChange={e => s(field, e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm', errors[field] && 'border-red-500')}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {errors[field] && <p className="mt-1 text-xs text-red-600">{errors[field]}</p>}
    </div>
  );

  const ta = (label: string, field: string, placeholder?: string) => (
    <div className="col-span-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea value={v(field)} onChange={e => s(field, e.target.value)} rows={2}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder={placeholder || ''} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">{project ? 'Edit Project' : 'Create New Project'}</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Basic */}
          <section className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Building2 className="w-5 h-5 text-blue-600" /> Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inp('Project Number', 'projectNumber', { readOnly: true })}
              {inp('Project Name', 'projectName', { required: true, placeholder: 'Enter project name' })}
              {sel('Project Type', 'projectType', [{ value: 'running', label: 'Running' }, { value: 'dedicated', label: 'Dedicated' }, { value: 'maintenance', label: 'Maintenance' }])}
              {sel('Current Phase', 'currentPhase', [{ value: 'UI', label: 'UI / UX' }, { value: 'Development', label: 'Development' }, { value: 'QA', label: 'QA' }, { value: 'UAT', label: 'UAT' }, { value: 'Live', label: 'Live' }])}
              {sel('Priority', 'priority', [{ value: 'Low', label: 'Low' }, { value: 'Medium', label: 'Medium' }, { value: 'High', label: 'High' }, { value: 'Critical', label: 'Critical' }])}
              {sel('Status', 'status', [{ value: 'Active', label: 'Active' }, { value: 'On Hold', label: 'On Hold' }, { value: 'Completed', label: 'Completed' }, { value: 'Cancelled', label: 'Cancelled' }])}
            </div>
          </section>
          {/* Client */}
          <section className="bg-green-50/60 border border-green-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><User className="w-5 h-5 text-green-600" /> Client Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inp('Client Name', 'clientName', { required: true, icon: User, placeholder: 'Contact person' })}
              {inp('Client Email', 'clientEmail', { required: true, type: 'email', icon: Mail, placeholder: 'email@company.com' })}
              {inp('Client Phone', 'clientPhone', { icon: Phone, placeholder: '+91 XXXXX XXXXX' })}
              {inp('Client Company', 'clientCompany', { icon: Building2, placeholder: 'Company name' })}
              {inp('Country', 'country', { icon: Globe, placeholder: 'Country' })}
              {sel('Sales Coordinator', 'salesCoordinator', [{ value: '', label: '-- Select --' }, { value: 'Sudha', label: 'Sudha' }, { value: 'Geetha', label: 'Geetha' }])}
            </div>
          </section>
          {/* Team */}
          <section className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Users className="w-5 h-5 text-purple-600" /> Team Assignment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {sel('Project Manager', 'projectManager', [{ value: '', label: '-- Select --' }, { value: 'Madhav', label: 'Madhav' }], true)}
              {inp('Completion %', 'completionPercentage', { type: 'number' })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team Members ({teamMembers.length})</label>
                <div className="border border-gray-200 bg-white rounded-lg p-2 max-h-36 overflow-y-auto">
                  {allTeam.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={teamMembers.includes(m.name)} onChange={() => setTeamMembers(p => p.includes(m.name) ? p.filter(x => x !== m.name) : [...p, m.name])} className="w-3.5 h-3.5 text-blue-600 rounded" />
                      <span className="text-sm">{m.name} <span className="text-xs text-gray-400">({m.department})</span></span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Resources ({primaryRes.length})</label>
                <div className="border border-gray-200 bg-white rounded-lg p-2 max-h-36 overflow-y-auto">
                  {allTeam.map(m => (
                    <label key={m.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input type="checkbox" checked={primaryRes.includes(m.name)} onChange={() => setPrimaryRes(p => p.includes(m.name) ? p.filter(x => x !== m.name) : [...p, m.name])} className="w-3.5 h-3.5 text-blue-600 rounded" />
                      <span className="text-sm">{m.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
          {/* Platforms */}
          <section className="bg-orange-50/60 border border-orange-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Smartphone className="w-5 h-5 text-orange-600" /> Platforms</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([['android', 'Android', Smartphone], ['ios', 'iOS', Smartphone], ['webFe', 'Web Frontend', Monitor], ['webBe', 'Web Backend', Globe]] as const).map(([key, label, Icon]) => (
                <label key={key} className={cn('flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition', plat[key] ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                  <input type="checkbox" checked={plat[key]} onChange={() => setPlat(p => ({ ...p, [key]: !p[key] }))} className="w-4 h-4 text-blue-600 rounded" />
                  <Icon className="w-4 h-4 text-gray-500" /><span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </section>
          {/* Dates */}
          <section className="bg-cyan-50/60 border border-cyan-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Calendar className="w-5 h-5 text-cyan-600" /> Project Dates</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inp('Start Date', 'startDate', { type: 'date', icon: Calendar })}
              {inp('Planned Closure', 'plannedClosureDate', { type: 'date', icon: Calendar })}
              {inp('Actual Closure', 'actualClosureDate', { type: 'date', icon: Calendar })}
            </div>
          </section>
          {/* Weekly */}
          <section className="bg-yellow-50/60 border border-yellow-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Calendar className="w-5 h-5 text-yellow-600" /> Weekly Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ta('Current Week Updates', 'currentWeekUpdates', 'What was accomplished this week?')}
              {ta('Next Week Target', 'nextWeekTarget', 'Planned for next week?')}
            </div>
          </section>
          {/* Risks */}
          <section className="bg-red-50/60 border border-red-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><AlertCircle className="w-5 h-5 text-red-600" /> Risks & Escalations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ta('Risks / Issues (comma separated)', 'risks', 'Risk 1, Risk 2')}
              {ta('Escalations (comma separated)', 'escalations', 'Escalation 1, ...')}
            </div>
          </section>
          {/* Links */}
          <section className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><LinkIcon className="w-5 h-5 text-indigo-600" /> Technical Assets & Links</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Project Tracker Link', 'projectTrackerLink', { icon: LinkIcon, placeholder: 'https://...' })}
              {inp('Figma Link', 'figmaLink', { icon: LinkIcon, placeholder: 'https://figma.com/...' })}
              {inp('Git Repository', 'gitRepository', { icon: LinkIcon, placeholder: 'https://github.com/...' })}
              {inp('Server Details', 'serverDetails', { placeholder: 'AWS EC2, Azure, etc.' })}
              {inp('Hosting Details', 'hostingDetails', { placeholder: 'Hosting provider' })}
            </div>
          </section>
          {/* Remarks */}
          <section className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
            {ta('Remarks', 'remarks', 'Additional notes')}
          </section>
          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={cn('flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow', isSubmitting && 'opacity-50 cursor-not-allowed')}>
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
