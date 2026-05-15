import React, { useState, useEffect } from 'react';
import { mockTasks } from '../data/mockData';
import { TaskForm } from '../components/Tasks/TaskForm';
import { getTasksFromStorage, saveTasksToStorage, getProjectsFromStorage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { canManageProjects } from '../utils/permissions';
import { notifyTaskCreated, notifyTaskStatusChanged, notifyTaskDeleted } from '../utils/notificationEngine';
import type { TaskStatus, TaskPriority, Task, Project } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';
import { Search, Filter, Plus, Calendar, Clock, CheckCircle2, Circle, Play, RotateCcw, Edit2, Trash2, Eye, X, Info, FolderKanban, LayoutGrid, Users, ChevronDown, ChevronUp } from 'lucide-react';

const statusConfig: Record<TaskStatus, { color: string; icon: typeof Circle; bg: string }> = {
  'Open': { color: 'text-gray-700', icon: Circle, bg: 'bg-gray-100' },
  'In Progress': { color: 'text-blue-700', icon: Play, bg: 'bg-blue-100' },
  'QA': { color: 'text-purple-700', icon: Clock, bg: 'bg-purple-100' },
  'Completed': { color: 'text-green-700', icon: CheckCircle2, bg: 'bg-green-100' },
  'Reopened': { color: 'text-red-700', icon: RotateCcw, bg: 'bg-red-100' }
};
const priorityDot: Record<TaskPriority, string> = { 'Critical': 'bg-red-500', 'High': 'bg-orange-500', 'Medium': 'bg-yellow-500', 'Low': 'bg-green-500' };
const priorityBadge: Record<TaskPriority, string> = { 'Critical': 'bg-red-100 text-red-700', 'High': 'bg-orange-100 text-orange-700', 'Medium': 'bg-yellow-100 text-yellow-700', 'Low': 'bg-green-100 text-green-700' };

type ViewMode = 'kanban' | 'project' | 'resource';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const isManager = canManageProjects(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load data
  useEffect(() => {
    const st = getTasksFromStorage();
    setAllTasks(st.length > 0 ? st : (() => { saveTasksToStorage(mockTasks); return mockTasks; })());
    setProjects(getProjectsFromStorage());
  }, []);

  // Strict user filtering - resources ONLY see their own tasks
  const visibleTasks = React.useMemo(() => {
    if (!user) return [];
    if (['super_admin', 'management', 'project_manager', 'team_lead'].includes(user.role)) return allTasks;
    // Strict: only tasks where assignedTo === this user's name
    return allTasks.filter(t => t.assignedTo === user.name);
  }, [user, allTasks]);

  // Save helper - updates localStorage immediately
  const persistTasks = (updated: Task[]) => { setAllTasks(updated); saveTasksToStorage(updated); };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    if (editingTask) {
      persistTasks(allTasks.map(t => t.id === editingTask.id ? { ...t, ...taskData, updatedAt: new Date() } as Task : t));
    } else {
      const newTask = { ...taskData, id: `task-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), comments: [], attachments: [] } as Task;
      persistTasks([...allTasks, newTask]);
      notifyTaskCreated(newTask.title, newTask.taskId, newTask.projectName, newTask.assignedTo, user?.name || 'PM');
    }
    setShowTaskForm(false); setEditingTask(null);
  };

  // Inline status update — fires notification
  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    const task = allTasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      notifyTaskStatusChanged(task.title, task.taskId, task.projectName, task.assignedTo, task.status, newStatus);
    }
    persistTasks(allTasks.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t));
  };

  const handleCompletionChange = (taskId: string, hours: number) => {
    persistTasks(allTasks.map(t => t.id === taskId ? { ...t, actualHours: hours, updatedAt: new Date() } : t));
  };

  const handleEditTask = (task: Task) => { setEditingTask(task); setSelectedProjectId(task.projectId); setShowTaskForm(true); };
  const handleDeleteTask = (taskId: string) => {
    const task = allTasks.find(t => t.id === taskId);
    if (window.confirm('Delete this task?')) {
      if (task) notifyTaskDeleted(task.title, user?.name || 'PM', task.assignedTo);
      persistTasks(allTasks.filter(t => t.id !== taskId));
    }
  };

  // Apply search/filters on visible tasks
  const filteredTasks = visibleTasks.filter(t => {
    const s = searchQuery.toLowerCase();
    return (!s || t.title.toLowerCase().includes(s) || t.projectName.toLowerCase().includes(s) || t.assignedTo.toLowerCase().includes(s))
      && (selectedStatus === 'all' || t.status === selectedStatus)
      && (selectedPriority === 'all' || t.priority === selectedPriority);
  });

  // Grouping helpers
  const tasksByStatus: Record<string, Task[]> = { 'Open': [], 'In Progress': [], 'QA': [], 'Completed': [] };
  filteredTasks.forEach(t => { if (tasksByStatus[t.status]) tasksByStatus[t.status].push(t); });

  const tasksByProject: Record<string, Task[]> = {};
  filteredTasks.forEach(t => { const k = t.projectName || 'Unassigned'; (tasksByProject[k] = tasksByProject[k] || []).push(t); });

  const tasksByResource: Record<string, Task[]> = {};
  filteredTasks.forEach(t => { const k = t.assignedTo || 'Unassigned'; (tasksByResource[k] = tasksByResource[k] || []).push(t); });

  const toggleCollapse = (key: string) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  const stats = [
    { label: 'Total', value: visibleTasks.length, color: 'bg-blue-500' },
    { label: 'In Progress', value: visibleTasks.filter(t => t.status === 'In Progress').length, color: 'bg-yellow-500' },
    { label: 'In QA', value: visibleTasks.filter(t => t.status === 'QA').length, color: 'bg-purple-500' },
    { label: 'Completed', value: visibleTasks.filter(t => t.status === 'Completed').length, color: 'bg-green-500' },
  ];

  // Reusable task row for table views
  const TaskRow = ({ task }: { task: Task }) => {
    const isOwner = user?.name === task.assignedTo;
    const canEdit = isManager || isOwner;
    const pct = task.estimatedHours > 0 ? Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100)) : 0;
    return (
      <tr className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
        <td className="px-4 py-3"><span className="text-xs text-gray-500">{task.taskId}</span></td>
        <td className="px-4 py-3">
          <p className="font-medium text-gray-900 text-sm">{task.title}</p>
          {task.moduleName && <p className="text-xs text-gray-400">{task.moduleName}</p>}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{task.projectName}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
              {task.assignedTo.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <span className="text-sm text-gray-700">{task.assignedTo}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span className={cn('px-2 py-0.5 text-xs rounded-full', priorityBadge[task.priority])}>{task.priority}</span>
        </td>
        <td className="px-4 py-3">
          {/* Inline status selector — editable by owner or manager */}
          {canEdit ? (
            <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
              className={cn('text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-2 focus:ring-blue-400', statusConfig[task.status].bg, statusConfig[task.status].color)}>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="QA">QA</option>
              <option value="Completed">Completed</option>
              <option value="Reopened">Reopened</option>
            </select>
          ) : (
            <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', statusConfig[task.status].bg, statusConfig[task.status].color)}>{task.status}</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full', pct >= 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-yellow-500')} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 mt-1">
              <input type="number" min="0" step="0.5" value={task.actualHours}
                onChange={e => handleCompletionChange(task.id, parseFloat(e.target.value) || 0)}
                className="w-14 text-xs px-1 py-0.5 border border-gray-200 rounded focus:ring-1 focus:ring-blue-400" />
              <span className="text-[10px] text-gray-400">/ {task.estimatedHours}h</span>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">{formatDate(task.dueDate)}</td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <button onClick={() => setViewingTask(task)} className="p-1 text-green-500 hover:bg-green-50 rounded"><Eye className="w-3.5 h-3.5" /></button>
            {canEdit && <button onClick={() => handleEditTask(task)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>}
            {isManager && <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>}
          </div>
        </td>
      </tr>
    );
  };

  // Grouped table section with collapse
  const GroupSection = ({ title, tasks: groupTasks, badge, color }: { title: string; tasks: Task[]; badge: string; color: string }) => {
    const isOpen = !collapsed[title];
    const completedCount = groupTasks.filter(t => t.status === 'Completed').length;
    const groupPct = groupTasks.length > 0 ? Math.round((completedCount / groupTasks.length) * 100) : 0;
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button onClick={() => toggleCollapse(title)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <div className={cn('w-3 h-3 rounded-full', color)} />
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">{groupTasks.length} tasks</span>
            <span className="text-xs text-gray-400">{badge}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${groupPct}%` }} />
              </div>
              <span className="text-xs text-gray-500">{groupPct}%</span>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>
        {isOpen && groupTasks.length > 0 && (
          <table className="w-full">
            <thead className="bg-gray-50 border-t border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-20">ID</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-20">Priority</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-28">Status</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-32">Progress</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-20">Due</th>
                <th className="px-4 py-2 text-left text-[10px] font-medium text-gray-500 uppercase w-20">Actions</th>
              </tr>
            </thead>
            <tbody>{groupTasks.map(t => <TaskRow key={t.id} task={t} />)}</tbody>
          </table>
        )}
        {isOpen && groupTasks.length === 0 && (
          <p className="text-center py-6 text-gray-400 text-sm border-t border-gray-200">No tasks</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Tickets</h1>
          <p className="text-gray-500 mt-1">
            {isManager ? 'Manage all project tasks' : `Your assigned tasks (${visibleTasks.length})`}
          </p>
        </div>
        {isManager && (
          <button onClick={() => { setEditingTask(null); setSelectedProjectId(''); setShowTaskForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" /> Create Task
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2"><div className={`w-3 h-3 rounded-full ${s.color}`} /><span className="text-sm text-gray-500">{s.label}</span></div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* No Tasks Banner */}
      {visibleTasks.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div><p className="font-medium text-yellow-900">No Tasks Found</p><p className="text-sm text-yellow-700 mt-1">You don't have any tasks assigned yet.</p></div>
        </div>
      )}

      {/* View Mode Tabs + Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'kanban' as ViewMode, label: 'Kanban', icon: LayoutGrid },
            { id: 'project' as ViewMode, label: 'By Project', icon: FolderKanban },
            { id: 'resource' as ViewMode, label: 'By Resource', icon: Users },
          ].map(v => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setViewMode(v.id)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', viewMode === v.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
                <Icon className="w-4 h-4" />{v.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn('flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm', showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50')}>
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-3">
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as TaskStatus | 'all')} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Statuses</option><option value="Open">Open</option><option value="In Progress">In Progress</option><option value="QA">QA</option><option value="Completed">Completed</option><option value="Reopened">Reopened</option>
          </select>
          <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value as TaskPriority | 'all')} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm">
            <option value="all">All Priorities</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
          </select>
        </div>
      )}

      {/* ════════════ KANBAN VIEW ════════════ */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {(['Open', 'In Progress', 'QA', 'Completed'] as TaskStatus[]).map(status => {
            const sTasks = tasksByStatus[status] || [];
            const cfg = statusConfig[status]; const Icon = cfg.icon;
            return (
              <div key={status} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4"><Icon className={cn('w-4 h-4', cfg.color)} /><h3 className="font-semibold text-gray-900 text-sm">{status}</h3><span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">{sTasks.length}</span></div>
                <div className="space-y-3">
                  {sTasks.map(task => {
                    const isOwner = user?.name === task.assignedTo;
                    const canEdit = isManager || isOwner;
                    return (
                      <div key={task.id} className="bg-white p-3.5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="text-[10px] text-gray-400">{task.taskId}</span>
                          <div className="flex gap-0.5">
                            <button onClick={() => setViewingTask(task)} className="p-0.5 text-green-500 hover:text-green-700"><Eye className="w-3.5 h-3.5" /></button>
                            {canEdit && <button onClick={() => handleEditTask(task)} className="p-0.5 text-blue-500 hover:text-blue-700"><Edit2 className="w-3.5 h-3.5" /></button>}
                            {isManager && <button onClick={() => handleDeleteTask(task.id)} className="p-0.5 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{task.title}</h4>
                        <div className="flex items-center gap-1.5 mb-2"><span className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} /><span className={cn('text-[10px] px-1.5 py-0.5 rounded', priorityBadge[task.priority])}>{task.priority}</span></div>

                        {/* Inline status change for owner */}
                        {canEdit && (
                          <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className={cn('w-full text-xs font-medium px-2 py-1 rounded-lg border cursor-pointer mb-2', statusConfig[task.status].bg, statusConfig[task.status].color, 'border-gray-200')}>
                            <option value="Open">⚪ Open</option><option value="In Progress">🔵 In Progress</option><option value="QA">🟣 QA</option><option value="Completed">🟢 Completed</option><option value="Reopened">🔴 Reopened</option>
                          </select>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(task.dueDate)}</div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.actualHours}/{task.estimatedHours}h</div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[8px] font-bold">{task.assignedTo.split(' ').map((n: string) => n[0]).join('')}</div>
                            <span className="text-gray-600">{task.assignedTo}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {sTasks.length === 0 && <p className="text-center py-8 text-gray-400 text-xs">No tasks</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════ PROJECT WISE VIEW ════════════ */}
      {viewMode === 'project' && (
        <div className="space-y-4">
          {Object.keys(tasksByProject).length === 0 && <p className="text-center py-12 text-gray-400">No tasks match your filters</p>}
          {Object.entries(tasksByProject).map(([projectName, pTasks]) => {
            const project = projects.find(p => p.projectName === projectName);
            return (
              <GroupSection key={projectName} title={projectName} tasks={pTasks}
                badge={project ? `${project.projectNumber} • ${project.currentPhase} • ${project.completionPercentage}%` : ''}
                color="bg-blue-500" />
            );
          })}
        </div>
      )}

      {/* ════════════ RESOURCE WISE VIEW ════════════ */}
      {viewMode === 'resource' && (
        <div className="space-y-4">
          {Object.keys(tasksByResource).length === 0 && <p className="text-center py-12 text-gray-400">No tasks match your filters</p>}
          {Object.entries(tasksByResource).map(([resourceName, rTasks]) => (
            <GroupSection key={resourceName} title={resourceName} tasks={rTasks}
              badge={`${rTasks.filter(t => t.status === 'Completed').length}/${rTasks.length} completed`}
              color="bg-purple-500" />
          ))}
        </div>
      )}

      {/* Task Form */}
      <TaskForm task={editingTask} isOpen={showTaskForm}
        onClose={() => { setShowTaskForm(false); setEditingTask(null); setSelectedProjectId(''); }}
        onSave={handleSaveTask} projectId={selectedProjectId} />

      {/* Task Detail View */}
      {viewingTask && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div><h3 className="text-lg font-bold text-gray-900">{viewingTask.title}</h3><p className="text-sm text-gray-500">{viewingTask.taskId} • {viewingTask.projectName}</p></div>
              <button onClick={() => setViewingTask(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={cn('px-3 py-1 text-sm font-medium rounded-full', statusConfig[viewingTask.status].bg, statusConfig[viewingTask.status].color)}>{viewingTask.status}</span>
                <span className={cn('px-3 py-1 text-sm font-medium rounded-full', priorityBadge[viewingTask.priority])}>{viewingTask.priority}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Module</p><p className="font-medium text-gray-900">{viewingTask.moduleName || 'N/A'}</p></div>
                <div><p className="text-gray-500">Project</p><p className="font-medium text-gray-900">{viewingTask.projectName}</p></div>
                <div><p className="text-gray-500">Assigned To</p><p className="font-medium text-gray-900">{viewingTask.assignedTo}</p></div>
                <div><p className="text-gray-500">Assigned By</p><p className="font-medium text-gray-900">{viewingTask.assignedBy || 'N/A'}</p></div>
              </div>
              {viewingTask.description && <div className="bg-gray-50 p-4 rounded-lg"><h4 className="font-semibold text-gray-900 mb-2">Description</h4><p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingTask.description}</p></div>}
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Timeline & Hours</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-gray-500">Start</p><p className="font-medium">{formatDate(viewingTask.startDate)}</p></div>
                  <div><p className="text-gray-500">Due</p><p className="font-medium">{formatDate(viewingTask.dueDate)}</p></div>
                  <div><p className="text-gray-500">Estimated</p><p className="font-medium">{viewingTask.estimatedHours}h</p></div>
                  <div><p className="text-gray-500">Actual</p><p className="font-medium">{viewingTask.actualHours}h</p></div>
                </div>
                {viewingTask.estimatedHours > 0 && (
                  <div className="mt-3"><div className="flex justify-between text-xs text-gray-600 mb-1"><span>Progress</span><span>{Math.min(100, Math.round((viewingTask.actualHours / viewingTask.estimatedHours) * 100))}%</span></div>
                    <div className="h-2 bg-white rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (viewingTask.actualHours / viewingTask.estimatedHours) * 100)}%` }} /></div></div>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => { setViewingTask(null); handleEditTask(viewingTask); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
                <button onClick={() => setViewingTask(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
