import React, { useState, useEffect } from 'react';
import { getProjectsFromStorage as gp, getTasksFromStorage as gt, getResourcesFromStorage as gr, getMilestonesFromStorage as gm } from '../utils/storage';
import type { Project, Task, Resource, Milestone } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Download, FileText, TrendingUp, Users, Briefcase, Clock, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

type ReportType = 'overview' | 'projects' | 'tasks' | 'resources' | 'collections' | 'delayed';

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    setProjects(gp()); setTasks(gt()); setResources(gr()); setMilestones(gm());
  }, []);

  // Computed data
  const activeProjects = projects.filter(p => p.status === 'Active');
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const avgCompletion = activeProjects.length > 0 ? Math.round(activeProjects.reduce((a, p) => a + p.completionPercentage, 0) / activeProjects.length) : 0;
  const totalRevenue = milestones.filter(m => m.category === 'sales').reduce((a, m) => a + m.amount, 0);
  const received = milestones.filter(m => m.category === 'sales' && m.paymentStatus === 'Received').reduce((a, m) => a + m.amount, 0);
  const pending = milestones.filter(m => m.category === 'sales' && m.paymentStatus === 'Pending').reduce((a, m) => a + m.amount, 0);
  const delayedProjects = projects.filter(p => p.status === 'Active' && p.plannedClosureDate && new Date(p.plannedClosureDate) < new Date() && p.completionPercentage < 100);
  const avgOccupancy = resources.length > 0 ? Math.round(resources.reduce((a, r) => a + r.occupancyPercentage, 0) / resources.length) : 0;

  // Chart data
  const phaseData = ['UI', 'Development', 'QA', 'UAT', 'Live'].map(phase => ({
    name: phase, count: activeProjects.filter(p => p.currentPhase === phase).length
  }));
  const taskStatusData = [
    { name: 'Open', value: tasks.filter(t => t.status === 'Open').length, color: '#6B7280' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, color: '#3B82F6' },
    { name: 'QA', value: tasks.filter(t => t.status === 'QA').length, color: '#8B5CF6' },
    { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: '#10B981' },
  ];
  const priorityData = ['Critical', 'High', 'Medium', 'Low'].map(p => ({ name: p, count: tasks.filter(t => t.priority === p).length }));
  const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];

  const reports: { id: ReportType; label: string; icon: typeof BarChart3 }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'tasks', label: 'Tasks', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'collections', label: 'Collections', icon: DollarSign },
    { id: 'delayed', label: 'Delayed', icon: AlertCircle },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1><p className="text-gray-500 mt-1">Live data from your projects, tasks & resources</p></div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {reports.map(r => { const I = r.icon; return (
          <button key={r.id} onClick={() => setActiveReport(r.id)} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap', activeReport === r.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
            <I className="w-4 h-4" /> {r.label}
          </button>
        ); })}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeReport === 'overview' && (<div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { l: 'Active Projects', v: activeProjects.length, i: Briefcase, c: 'text-blue-600 bg-blue-100' },
            { l: 'Avg Completion', v: `${avgCompletion}%`, i: TrendingUp, c: 'text-green-600 bg-green-100' },
            { l: 'Total Tasks', v: tasks.length, i: FileText, c: 'text-purple-600 bg-purple-100' },
            { l: 'Avg Occupancy', v: `${avgOccupancy}%`, i: Users, c: 'text-orange-600 bg-orange-100' },
            { l: 'Revenue Total', v: formatCurrency(totalRevenue), i: DollarSign, c: 'text-green-600 bg-green-100' },
            { l: 'Received', v: formatCurrency(received), i: CheckCircle2, c: 'text-green-600 bg-green-100' },
            { l: 'Pending', v: formatCurrency(pending), i: Clock, c: 'text-yellow-600 bg-yellow-100' },
            { l: 'Delayed Projects', v: delayedProjects.length, i: AlertCircle, c: 'text-red-600 bg-red-100' },
          ].map(st => { const I = st.i; return (
            <div key={st.l} className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2"><div className={cn('p-1.5 rounded-lg', st.c.split(' ')[1])}><I className={cn('w-4 h-4', st.c.split(' ')[0])} /></div><span className="text-xs text-gray-500">{st.l}</span></div>
              <p className="text-xl font-bold text-gray-900">{st.v}</p>
            </div>
          ); })}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Projects by Phase</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={phaseData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="count" fill="#3B82F6" radius={[4,4,0,0]} /></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">{taskStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>)}

      {/* ═══ PROJECTS ═══ */}
      {activeReport === 'projects' && (<div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full"><thead className="bg-gray-50 border-b"><tr>
          <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Project</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Client</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Phase</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Progress</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Team</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Risks</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Planned Close</th>
        </tr></thead><tbody className="divide-y divide-gray-100">
          {projects.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3"><p className="font-medium text-gray-900 text-sm">{p.projectName}</p><p className="text-xs text-gray-400">{p.projectNumber}</p></td>
              <td className="px-4 py-3 text-sm text-gray-600">{p.clientCompany}</td>
              <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] rounded-full', p.currentPhase === 'Live' ? 'bg-green-100 text-green-700' : p.currentPhase === 'UAT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700')}>{p.currentPhase}</span></td>
              <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', p.completionPercentage >= 90 ? 'bg-green-500' : 'bg-blue-500')} style={{width:`${p.completionPercentage}%`}} /></div><span className="text-xs">{p.completionPercentage}%</span></div></td>
              <td className="px-4 py-3 text-sm text-gray-600">{p.assignedTeamMembers.length}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{p.risks?.length || 0}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(p.plannedClosureDate)}</td>
            </tr>
          ))}
        </tbody></table>
      </div>)}

      {/* ═══ TASKS ═══ */}
      {activeReport === 'tasks' && (<div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData}><CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Bar dataKey="count" radius={[4,4,0,0]}>{priorityData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Task Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg text-center"><p className="text-2xl font-bold text-gray-900">{tasks.length}</p><p className="text-xs text-gray-500">Total Tasks</p></div>
              <div className="p-3 bg-green-50 rounded-lg text-center"><p className="text-2xl font-bold text-green-600">{completedTasks}</p><p className="text-xs text-gray-500">Completed</p></div>
              <div className="p-3 bg-blue-50 rounded-lg text-center"><p className="text-2xl font-bold text-blue-600">{tasks.filter(t => t.status === 'In Progress').length}</p><p className="text-xs text-gray-500">In Progress</p></div>
              <div className="p-3 bg-red-50 rounded-lg text-center"><p className="text-2xl font-bold text-red-600">{tasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length}</p><p className="text-xs text-gray-500">Overdue</p></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Task</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Project</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Assignee</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Priority</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Status</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Hours</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{tasks.map(t => (
            <tr key={t.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.title}</td>
              <td className="px-4 py-3 text-xs text-gray-600">{t.projectName}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{t.assignedTo}</td>
              <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] rounded-full', t.priority === 'Critical' ? 'bg-red-100 text-red-700' : t.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700')}>{t.priority}</span></td>
              <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] rounded-full', t.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>{t.status}</span></td>
              <td className="px-4 py-3 text-xs text-gray-600">{t.actualHours}/{t.estimatedHours}h</td>
            </tr>
          ))}</tbody></table>
        </div>
      </div>)}

      {/* ═══ RESOURCES ═══ */}
      {activeReport === 'resources' && (<div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Resource</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Department</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Skills</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500 w-40">Occupancy</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Rate</th></tr></thead>
        <tbody className="divide-y divide-gray-100">{resources.map(r => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-4 py-3"><p className="font-medium text-gray-900 text-sm">{r.name}</p><p className="text-xs text-gray-400">{r.email}</p></td>
            <td className="px-4 py-3 text-sm text-gray-600">{r.department}</td>
            <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{r.skills.slice(0,3).map(s => <span key={s} className="px-1.5 py-0.5 text-[9px] bg-gray-100 text-gray-600 rounded">{s}</span>)}</div></td>
            <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"><div className={cn('h-full rounded-full', r.occupancyPercentage >= 90 ? 'bg-red-500' : r.occupancyPercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500')} style={{width:`${r.occupancyPercentage}%`}} /></div><span className="text-xs w-8 text-right">{r.occupancyPercentage}%</span></div></td>
            <td className="px-4 py-3 text-sm text-gray-600">${r.hourlyRate}/hr</td>
          </tr>
        ))}</tbody></table>
      </div>)}

      {/* ═══ COLLECTIONS ═══ */}
      {activeReport === 'collections' && (<div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-5 rounded-xl border border-green-200 text-center"><p className="text-2xl font-bold text-green-600">{formatCurrency(received)}</p><p className="text-sm text-gray-600">Received</p></div>
          <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 text-center"><p className="text-2xl font-bold text-yellow-600">{formatCurrency(pending)}</p><p className="text-sm text-gray-600">Pending</p></div>
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 text-center"><p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p><p className="text-sm text-gray-600">Total</p></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full"><thead className="bg-gray-50 border-b"><tr><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Milestone</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Project</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Type</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Amount</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Due</th><th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{milestones.filter(m => m.category === 'sales').map(m => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{m.projectName}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded-full">{m.type}</span></td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(m.amount)}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatDate(m.dueDate)}</td>
              <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] rounded-full', m.paymentStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{m.paymentStatus}</span></td>
            </tr>
          ))}</tbody></table>
        </div>
      </div>)}

      {/* ═══ DELAYED ═══ */}
      {activeReport === 'delayed' && (<div className="space-y-4">
        {delayedProjects.length === 0 && <div className="text-center py-16 bg-white rounded-xl border border-gray-200"><CheckCircle2 className="w-16 h-16 text-green-300 mx-auto mb-4" /><h3 className="font-medium text-gray-900">No delayed projects!</h3></div>}
        {delayedProjects.map(p => (
          <div key={p.id} className="bg-white p-5 rounded-xl border border-red-200">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-semibold text-gray-900">{p.projectName}</h3><p className="text-sm text-gray-500">{p.projectNumber} • {p.clientCompany}</p></div>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Delayed</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><p className="text-gray-500">Planned Close</p><p className="font-medium text-red-600">{formatDate(p.plannedClosureDate)}</p></div>
              <div><p className="text-gray-500">Completion</p><p className="font-medium text-gray-900">{p.completionPercentage}%</p></div>
              <div><p className="text-gray-500">Phase</p><p className="font-medium text-gray-900">{p.currentPhase}</p></div>
              <div><p className="text-gray-500">Risks</p><p className="font-medium text-gray-900">{p.risks?.length || 0}</p></div>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-3"><div className="h-full bg-red-500 rounded-full" style={{width:`${p.completionPercentage}%`}} /></div>
          </div>
        ))}
      </div>)}
    </div>
  );
};
