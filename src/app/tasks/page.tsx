"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  BarChart3,
} from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string | null;
}

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
}

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedTo: number | null;
  createdBy: number | null;
  status: string;
  priority: string;
  estimatedHours: string | null;
  actualHours: string | null;
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  tags: string[];
  relatedMilestone: string | null;
  progress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

const taskStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "text-gray-600", bg: "bg-gray-100" },
  in_progress: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100" },
  review: { label: "In Review", color: "text-purple-600", bg: "bg-purple-100" },
  done: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  blocked: { label: "Blocked", color: "text-red-600", bg: "bg-red-100" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-green-600", bg: "bg-green-100" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-100" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchTeamMembers();
  }, [search, projectFilter, statusFilter, priorityFilter, assignedFilter]);

  async function fetchTasks() {
    try {
      let url = "/api/tasks?";
      if (projectFilter) url += `projectId=${projectFilter}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (assignedFilter) url += `assignedTo=${assignedFilter}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        let filtered = data.data;
        if (search) {
          filtered = filtered.filter((t: Task) =>
            t.title.toLowerCase().includes(search.toLowerCase())
          );
        }
        setTasks(filtered);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function fetchTeamMembers() {
    try {
      const res = await fetch("/api/team-members");
      const data = await res.json();
      if (data.success) setTeamMembers(data.data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }

  async function deleteTask(id: number) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  function toggleExpand(id: number) {
    const next = new Set(expandedTasks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTasks(next);
  }

  function getMemberName(memberId: number | null) {
    if (!memberId) return "Unassigned";
    const m = teamMembers.find((tm) => tm.id === memberId);
    return m ? m.name : "Unknown";
  }

  function getProjectName(projectId: number) {
    const p = projects.find((pr) => pr.id === projectId);
    return p ? `${p.projectNo} - ${p.projectName}` : "Unknown";
  }

  function getProjectShort(projectId: number) {
    const p = projects.find((pr) => pr.id === projectId);
    return p ? p.projectNo : "";
  }

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const reviewCount = tasks.filter((t) => t.status === "review").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const blockedCount = tasks.filter((t) => t.status === "blocked").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-500 mt-1">Assign and track tasks across all projects</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/projects" className="btn btn-secondary">
            <FileText className="w-4 h-4" /> Projects
          </Link>
          <Link href="/portal" className="btn btn-secondary">
            <Eye className="w-4 h-4" /> Resource Portal
          </Link>
          <button onClick={() => { setEditingTask(null); setShowModal(true); }} className="btn btn-primary">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "To Do", count: todoCount, color: "text-gray-600" },
          { label: "In Progress", count: inProgressCount, color: "text-blue-600" },
          { label: "In Review", count: reviewCount, color: "text-purple-600" },
          { label: "Completed", count: doneCount, color: "text-green-600" },
          { label: "Blocked", count: blockedCount, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search tasks..." className="form-input pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`btn ${showFilters ? "btn-primary" : "btn-secondary"}`}>
              <Filter className="w-4 h-4" /> Filters
            </button>
            <span className="text-sm text-gray-500">{tasks.length} tasks</span>
          </div>
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="form-label">Project</label>
                <select className="form-input" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                  <option value="">All Projects</option>
                  {projects.map((p) => (<option key={p.id} value={p.id}>{p.projectNo} - {p.projectName}</option>))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  {Object.entries(taskStatusConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select className="form-input" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                  <option value="">All Priority</option>
                  {Object.entries(priorityConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                </select>
              </div>
              <div>
                <label className="form-label">Assigned To</label>
                <select className="form-input" value={assignedFilter} onChange={(e) => setAssignedFilter(e.target.value)}>
                  <option value="">All Members</option>
                  {teamMembers.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card"><div className="card-body text-center py-12"><div className="spinner"></div></div></div>
        ) : tasks.length === 0 ? (
          <div className="card"><div className="card-body text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started</p>
            <button onClick={() => { setEditingTask(null); setShowModal(true); }} className="btn btn-primary">
              <Plus className="w-4 h-4" /> Create Task
            </button>
          </div></div>
        ) : (
          tasks.map((task) => {
            const sc = taskStatusConfig[task.status] || taskStatusConfig.todo;
            const pc = priorityConfig[task.priority] || priorityConfig.medium;
            const isExpanded = expandedTasks.has(task.id);
            return (
              <div key={task.id} className="card">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleExpand(task.id)} className="text-gray-400 hover:text-gray-600">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{task.title}</span>
                        <span className={`badge ${sc.bg} ${sc.color} text-xs`}>{sc.label}</span>
                        <span className={`badge ${pc.bg} ${pc.color} text-xs`}>{pc.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span className="text-blue-600 font-medium">{getProjectShort(task.projectId)}</span>
                        <span>Assigned: {getMemberName(task.assignedTo)}</span>
                        {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.estimatedHours || 0}h</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-20">
                          <div className="progress-bar-fill bg-blue-500" style={{ width: `${task.progress || 0}%` }}></div>
                        </div>
                        <span className="text-sm font-medium">{task.progress || 0}%</span>
                      </div>
                      <button onClick={() => { setEditingTask(task); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                        <p className="text-sm text-gray-600">{task.description || "No description"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-600">{task.notes || "No notes"}</p>
                      </div>
                      {task.tags && task.tags.length > 0 && (
                        <div className="md:col-span-2">
                          <p className="text-xs font-medium text-gray-500 mb-1">Tags</p>
                          <div className="flex flex-wrap gap-1">{task.tags.map((tag, i) => (<span key={i} className="badge badge-secondary text-xs">{tag}</span>))}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          projects={projects}
          teamMembers={teamMembers}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={(newTask) => {
            if (editingTask) {
              setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...newTask } : t)));
            } else {
              const fullTask: Task = {
                id: Date.now(),
                projectId: newTask.projectId ?? 0,
                title: newTask.title ?? "",
                description: newTask.description ?? "",
                assignedTo: newTask.assignedTo ?? null,
                createdBy: newTask.createdBy ?? null,
                status: newTask.status ?? "todo",
                priority: newTask.priority ?? "medium",
                estimatedHours: newTask.estimatedHours ?? null,
                actualHours: newTask.actualHours ?? null,
                startDate: newTask.startDate ?? null,
                dueDate: newTask.dueDate ?? null,
                completedDate: newTask.completedDate ?? null,
                tags: newTask.tags ?? [],
                relatedMilestone: newTask.relatedMilestone ?? null,
                progress: newTask.progress ?? "0",
                notes: newTask.notes ?? "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setTasks([...tasks, fullTask]);
            }
            setShowModal(false);
            setEditingTask(null);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

function TaskModal({ task, projects, teamMembers, onClose, onSave }: {
  task: Task | null;
  projects: Project[];
  teamMembers: TeamMember[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}) {
  const [formData, setFormData] = useState({
    projectId: task?.projectId || "",
    title: task?.title || "",
    description: task?.description || "",
    assignedTo: task?.assignedTo || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    estimatedHours: task?.estimatedHours || "",
    actualHours: task?.actualHours || "",
    startDate: task?.startDate || "",
    dueDate: task?.dueDate || "",
    relatedMilestone: task?.relatedMilestone || "",
    progress: task?.progress || "0",
    notes: task?.notes || "",
    tags: (task?.tags || []).join(", "),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;

    const payload = {
      projectId: parseInt(formData.projectId as string),
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo ? parseInt(formData.assignedTo as string) : null,
      status: formData.status,
      priority: formData.priority,
      estimatedHours: formData.estimatedHours || null,
      actualHours: formData.actualHours || null,
      startDate: formData.startDate || null,
      dueDate: formData.dueDate || null,
      relatedMilestone: formData.relatedMilestone || null,
      progress: formData.progress,
      notes: formData.notes,
      tags: formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean),
    };

    try {
      if (task?.id) {
        const res = await fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) onSave(data.data);
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) onSave(data.data);
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-xl" onClick={(e) => e.stopPropagation()}>
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">{task ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} required>
                <option value="">Select Project</option>
                {projects.map((p) => (<option key={p.id} value={p.id}>{p.projectNo} - {p.projectName}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder="Task title" />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <select className="form-input" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}>
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (<option key={m.id} value={m.id}>{m.name} - {m.role}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                {Object.entries(taskStatusConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                {Object.entries(priorityConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Related Milestone</label>
              <input type="text" className="form-input" value={formData.relatedMilestone} onChange={(e) => setFormData({ ...formData, relatedMilestone: e.target.value })} placeholder="e.g., Demo-1" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Task description..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input type="number" className="form-input" value={formData.estimatedHours} onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })} step="0.5" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Progress (%)</label>
              <input type="number" className="form-input" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: e.target.value })} min="0" max="100" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input type="text" className="form-input" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="frontend, bug, urgent" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input form-textarea" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Additional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary">{task ? "Update" : "Create"} Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
