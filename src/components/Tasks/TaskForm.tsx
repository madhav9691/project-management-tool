import React, { useState, useEffect } from 'react';
import type { Task, Project } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatters';
import { mockUsers } from '../../data/mockData';
import { getProjectsFromStorage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import { X, Save, User, Calendar, Clock, FolderKanban, FileText, Tag, Layers, Target } from 'lucide-react';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  projectId?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, isOpen, onClose, onSave, projectId }) => {
  const { user } = useAuth();
  const [f, setF] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => { if (isOpen) setProjects(getProjectsFromStorage()); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (task) {
      setF({
        taskId: task.taskId || '', projectId: task.projectId || '', projectName: task.projectName || '',
        moduleName: task.moduleName || '', title: task.title || '', description: task.description || '',
        priority: task.priority || 'Medium', assignedTo: task.assignedTo || '',
        assignedBy: task.assignedBy || '', startDate: task.startDate ? formatDate(task.startDate, 'yyyy-MM-dd') : '',
        dueDate: task.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd') : '',
        estimatedHours: task.estimatedHours ?? 0, actualHours: task.actualHours ?? 0, status: task.status || 'Open',
      });
    } else {
      const rid = Math.floor(1000 + Math.random() * 9000);
      setF({
        taskId: `TASK-${rid}`, projectId: projectId || '', projectName: '', moduleName: '', title: '',
        description: '', priority: 'Medium', assignedTo: '', assignedBy: user?.name || '',
        startDate: formatDate(new Date(), 'yyyy-MM-dd'),
        dueDate: formatDate(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd'),
        estimatedHours: 0, actualHours: 0, status: 'Open',
      });
    }
    setErrors({});
  }, [task, isOpen, projectId, user]);

  // Sync project name
  useEffect(() => {
    if (f.projectId && projects.length) {
      const p = projects.find(p => p.id === f.projectId);
      if (p && p.projectName !== f.projectName) setF(prev => ({ ...prev, projectName: p.projectName }));
    }
  }, [f.projectId, projects]);

  if (!isOpen) return null;

  const v = (k: string) => f[k] ?? '';
  const s = (k: string, val: any) => { setF(p => ({ ...p, [k]: val })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };
  const assignable = mockUsers.filter(u => ['developer', 'qa', 'team_lead'].includes(u.role) && u.isActive);
  const selectedProject = projects.find(p => p.id === f.projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v('title').trim()) errs.title = 'Task title is required';
    if (!v('projectId')) errs.projectId = 'Please select a project';
    if (!v('assignedTo')) errs.assignedTo = 'Please assign a resource';
    if (!v('dueDate')) errs.dueDate = 'Due date is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await onSave({
        taskId: v('taskId'), projectId: v('projectId'), projectName: v('projectName'),
        moduleName: v('moduleName'), title: v('title'), description: v('description'),
        priority: v('priority'), assignedTo: v('assignedTo'),
        assignedBy: v('assignedBy') || user?.name || 'Madhav',
        startDate: v('startDate') ? new Date(v('startDate')) : new Date(),
        dueDate: v('dueDate') ? new Date(v('dueDate')) : new Date(),
        estimatedHours: parseFloat(v('estimatedHours')) || 0,
        actualHours: parseFloat(v('actualHours')) || 0, status: v('status'),
      });
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', task ? 'bg-blue-100' : 'bg-green-100')}>
              <FileText className={cn('w-5 h-5', task ? 'text-blue-600' : 'text-green-600')} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{task ? 'Edit Task' : 'Create New Task'}</h3>
              <p className="text-sm text-gray-500">{v('taskId')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Selection */}
          <section className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><FolderKanban className="w-5 h-5 text-blue-600" /> Select Project</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
              <select value={v('projectId')} onChange={e => s('projectId', e.target.value)}
                className={cn('w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm', errors.projectId && 'border-red-500')}>
                <option value="">-- Select a Project --</option>
                {projects.filter(p => p.status === 'Active' || p.status === 'On Hold').map(p => (
                  <option key={p.id} value={p.id}>{p.projectNumber} — {p.projectName} ({p.clientCompany})</option>
                ))}
              </select>
              {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
              {selectedProject && (
                <div className="mt-3 p-3 bg-white border border-blue-200 rounded-lg flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg"><FolderKanban className="w-4 h-4 text-blue-600" /></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{selectedProject.projectName}</p>
                    <p className="text-xs text-gray-500">{selectedProject.clientCompany} • {selectedProject.currentPhase} • {selectedProject.completionPercentage}% done</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Task Details */}
          <section className="bg-green-50/60 border border-green-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-green-600" /> Task Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Task ID', 'taskId', { icon: Tag, readOnly: true })}
              {inp('Module Name', 'moduleName', { icon: Layers, placeholder: 'e.g. Payment, Auth, UI' })}
              <div className="md:col-span-2">{inp('Task Title', 'title', { required: true, icon: FileText, placeholder: 'Describe what needs to be done' })}</div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
                <textarea value={v('description')} onChange={e => s('description', e.target.value)} rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Detailed description, acceptance criteria, references..." />
              </div>
            </div>
          </section>

          {/* Assignment */}
          <section className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><User className="w-5 h-5 text-purple-600" /> Assignment & Priority</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To <span className="text-red-500">*</span></label>
                <select value={v('assignedTo')} onChange={e => s('assignedTo', e.target.value)}
                  className={cn('w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm', errors.assignedTo && 'border-red-500')}>
                  <option value="">-- Select Resource --</option>
                  {selectedProject && <optgroup label={`${selectedProject.projectName} Team`}>
                    {assignable.filter(u => selectedProject.assignedTeamMembers.includes(u.name)).map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.department})</option>
                    ))}
                  </optgroup>}
                  <optgroup label="All Resources">
                    {assignable.filter(u => !selectedProject?.assignedTeamMembers.includes(u.name)).map(u => (
                      <option key={u.id} value={u.name}>{u.name} ({u.department})</option>
                    ))}
                  </optgroup>
                </select>
                {errors.assignedTo && <p className="mt-1 text-xs text-red-600">{errors.assignedTo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={v('priority')} onChange={e => s('priority', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="Low">🟢 Low</option><option value="Medium">🟡 Medium</option><option value="High">🟠 High</option><option value="Critical">🔴 Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={v('status')} onChange={e => s('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="Open">⚪ Open</option><option value="In Progress">🔵 In Progress</option><option value="QA">🟣 QA</option><option value="Completed">🟢 Completed</option><option value="Reopened">🔴 Reopened</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
                <input type="text" value={v('assignedBy')} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm cursor-not-allowed" />
              </div>
            </div>
          </section>

          {/* Timeline */}
          <section className="bg-cyan-50/60 border border-cyan-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Calendar className="w-5 h-5 text-cyan-600" /> Timeline</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inp('Start Date', 'startDate', { type: 'date', icon: Calendar })}
              {inp('Due Date', 'dueDate', { required: true, type: 'date', icon: Target })}
              {inp('Estimated Hours', 'estimatedHours', { type: 'number', icon: Clock, placeholder: '0' })}
              {inp('Actual Hours', 'actualHours', { type: 'number', icon: Clock, placeholder: '0' })}
            </div>
            {v('startDate') && v('dueDate') && (
              <div className="mt-3 p-3 bg-white border border-cyan-200 rounded-lg flex items-center justify-between text-sm">
                <span className="text-gray-600">Duration: <strong>{Math.max(0, Math.ceil((new Date(v('dueDate')).getTime() - new Date(v('startDate')).getTime()) / 86400000))} days</strong></span>
                {v('estimatedHours') > 0 && <span className="text-gray-600">Hours: <strong>{v('actualHours')}/{v('estimatedHours')}h</strong></span>}
              </div>
            )}
          </section>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={cn('flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow', isSubmitting && 'opacity-50 cursor-not-allowed')}>
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
