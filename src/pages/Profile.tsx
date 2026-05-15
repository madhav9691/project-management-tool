import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';
import { canManageProjects } from '../utils/permissions';
import { ProjectsAPI, TasksAPI } from '../services/api';
import type { Project, Task } from '../types';
import { Mail, Building2, Calendar, Shield, Clock, CheckCircle2, FolderKanban, FileText, TrendingUp, Edit2, Save, X, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '' });
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);

  const isManager = canManageProjects(user);

  useEffect(() => {
    if (!user) return;
    setForm({ name: user.name, email: user.email, phone: user.phone || '', department: user.department });

    ProjectsAPI.getAll().then(all => {
      // For PM: show all projects. For resources: only assigned
      if (isManager) {
        setMyProjects(all);
      } else {
        setMyProjects(all.filter(p =>
          (p.assignedTeamMembers || []).includes(user.name) ||
          (p.primaryResources || []).includes(user.name) ||
          p.projectManager === user.name
        ));
      }
    });

    TasksAPI.getAll().then(all => {
      // For PM: show all tasks. For resources: only their own
      if (isManager) {
        setMyTasks(all);
      } else {
        setMyTasks(all.filter(t => t.assignedTo === user.name));
      }
    });
  }, [user, isManager]);

  if (!user) return null;

  // KPIs computed from the correctly filtered data
  const totalProjects = myProjects.length;
  const activeProjects = myProjects.filter(p => p.status === 'Active').length;
  const completedTasks = myTasks.filter(t => t.status === 'Completed').length;
  const inProgressTasks = myTasks.filter(t => t.status === 'In Progress').length;
  const qaTasks = myTasks.filter(t => t.status === 'QA').length;
  const openTasks = myTasks.filter(t => t.status === 'Open').length;
  const overdueTasks = myTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;
  const totalEstimated = myTasks.reduce((a, t) => a + (t.estimatedHours || 0), 0);
  const totalActual = myTasks.reduce((a, t) => a + (t.actualHours || 0), 0);
  const taskCompletionRate = myTasks.length > 0 ? Math.round((completedTasks / myTasks.length) * 100) : 0;
  const avgProjectCompletion = myProjects.length > 0 ? Math.round(myProjects.reduce((a, p) => a + p.completionPercentage, 0) / myProjects.length) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Banner */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative">
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 bg-white rounded-full border-4 border-white flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold shadow-lg">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
            <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"><Edit2 className="w-4 h-4" /> Edit Profile</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{user.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><Building2 className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{user.department}</span></div>
            <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-gray-400" /><span className="text-gray-600 capitalize">{user.role.replace('_', ' ')}</span></div>
            <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Joined {formatDate(user.createdAt)}</span></div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: 'Active Projects', v: activeProjects, sub: `${totalProjects} total`, i: FolderKanban, c: 'text-blue-600 bg-blue-100' },
          { l: 'Task Completion', v: `${taskCompletionRate}%`, sub: `${completedTasks}/${myTasks.length} tasks`, i: CheckCircle2, c: 'text-green-600 bg-green-100' },
          { l: 'In Progress', v: inProgressTasks, sub: `${openTasks} open, ${qaTasks} in QA`, i: Clock, c: 'text-yellow-600 bg-yellow-100' },
          { l: 'Hours Logged', v: `${totalActual}h`, sub: `${totalEstimated}h estimated`, i: TrendingUp, c: 'text-purple-600 bg-purple-100' },
        ].map(s => { const I = s.i; return (
          <div key={s.l} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2"><div className={cn('p-1.5 rounded-lg', s.c.split(' ')[1])}><I className={cn('w-4 h-4', s.c.split(' ')[0])} /></div><span className="text-xs text-gray-500">{s.l}</span></div>
            <p className="text-2xl font-bold text-gray-900">{s.v}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ); })}
      </div>

      {/* Avg Project Completion + Overdue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Average Project Completion</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90"><circle cx="40" cy="40" r="35" stroke="#E5E7EB" strokeWidth="6" fill="none" /><circle cx="40" cy="40" r="35" stroke={avgProjectCompletion >= 75 ? '#10B981' : avgProjectCompletion >= 40 ? '#3B82F6' : '#EAB308'} strokeWidth="6" fill="none" strokeDasharray={`${avgProjectCompletion * 2.2} 220`} strokeLinecap="round" /></svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">{avgProjectCompletion}%</span>
            </div>
            <div className="text-sm text-gray-600"><p>{activeProjects} active projects</p><p>{myProjects.filter(p => p.completionPercentage >= 90).length} nearing completion</p></div>
          </div>
        </div>
        {overdueTasks > 0 ? (
          <div className="bg-red-50 border border-red-200 p-5 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-900">{overdueTasks} Overdue Task{overdueTasks > 1 ? 's' : ''}</p>
              <p className="text-sm text-red-700 mt-1">{isManager ? 'Tasks assigned to your team are past due. Please follow up.' : 'Please update the status or request an extension from your PM.'}</p>
              <div className="mt-2 space-y-1">{myTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).slice(0, 3).map(t => (
                <p key={t.id} className="text-xs text-red-600">• {t.title} ({t.assignedTo}) — due {formatDate(t.dueDate)}</p>
              ))}</div>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 p-5 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
            <div><p className="font-semibold text-green-900">All Tasks On Track</p><p className="text-sm text-green-700 mt-1">No overdue tasks. Great work!</p></div>
          </div>
        )}
      </div>

      {/* My Projects */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><FolderKanban className="w-5 h-5" /> {isManager ? 'All Projects' : 'My Projects'} ({myProjects.length})</h3></div>
        <div className="divide-y divide-gray-100">
          {myProjects.slice(0, 10).map(p => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 text-sm truncate">{p.projectName}</p><p className="text-xs text-gray-500">{p.projectNumber} • {p.currentPhase} • {p.assignedTeamMembers?.length || 0} members</p></div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={cn('px-2 py-0.5 text-[10px] rounded-full', p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{p.status}</span>
                <div className="flex items-center gap-2"><div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', p.completionPercentage >= 90 ? 'bg-green-500' : 'bg-blue-500')} style={{ width: `${p.completionPercentage}%` }} /></div><span className="text-xs text-gray-500 w-8 text-right">{p.completionPercentage}%</span></div>
              </div>
            </div>
          ))}
          {myProjects.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No projects assigned</p>}
        </div>
      </div>

      {/* My Tasks */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5" /> {isManager ? 'All Tasks' : 'My Tasks'} ({myTasks.length})</h3></div>
        <div className="divide-y divide-gray-100">
          {myTasks.slice(0, 10).map(t => (
            <div key={t.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 text-sm truncate">{t.title}</p><p className="text-xs text-gray-500">{t.taskId} • {t.projectName}{isManager ? ` • ${t.assignedTo}` : ''}</p></div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn('px-2 py-0.5 text-[10px] rounded-full', t.status === 'Completed' ? 'bg-green-100 text-green-700' : t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : t.status === 'QA' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700')}>{t.status}</span>
                <span className={cn('px-2 py-0.5 text-[10px] rounded-full', t.priority === 'Critical' ? 'bg-red-100 text-red-700' : t.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')}>{t.priority}</span>
              </div>
            </div>
          ))}
          {myTasks.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No tasks assigned</p>}
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-bold text-gray-900">Edit Profile</h3><button onClick={() => setShowEdit(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="+91 XXXXX XXXXX" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input type="text" value={form.department} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-not-allowed" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={() => setShowEdit(false)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Save className="w-4 h-4" /> Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
