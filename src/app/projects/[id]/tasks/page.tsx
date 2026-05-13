"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, X, Calendar, ExternalLink, AlertTriangle,
  CheckCircle, Clock, Eye, Plus, Trash2, MessageSquare, Tag,
  ChevronDown, ChevronUp, BarChart3,
} from "lucide-react";

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

interface TeamMember {
  id: number;
  name: string;
  role: string | null;
}

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  todo: { label: "To Do", bg: "bg-gray-100", color: "text-gray-600" },
  in_progress: { label: "In Progress", bg: "bg-blue-100", color: "text-blue-600" },
  review: { label: "In Review", bg: "bg-purple-100", color: "text-purple-600" },
  done: { label: "Completed", bg: "bg-green-100", color: "text-green-600" },
  blocked: { label: "Blocked", bg: "bg-red-100", color: "text-red-600" },
};

export default function ProjectTasksPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [view, setView] = useState<"list" | "board">("list");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchMembers();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch("/api/team-members");
      const data = await res.json();
      if (data.success) setMembers(data.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }

  async function deleteTask(id: number) {
    if (!confirm("Delete this task?")) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  async function quickStatusUpdate(taskId: number, status: string) {
    const updates: Record<string, unknown> = { status };
    if (status === "done") {
      updates.completedDate = new Date().toISOString().split("T")[0];
      updates.progress = "100";
    }
    if (status === "in_progress" && !tasks.find((t) => t.id === taskId)?.startDate) {
      updates.startDate = new Date().toISOString().split("T")[0];
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  function getMemberName(id: number | null) {
    if (!id) return "Unassigned";
    return members.find((m) => m.id === id)?.name || "Unknown";
  }

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const taskCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    review: tasks.filter((t) => t.status === "review").length,
    done: tasks.filter((t) => t.status === "done").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`} className="btn btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
            <p className="text-gray-500 text-sm">Manage tasks for this project</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-sm rounded-md ${view === "list" ? "bg-white shadow" : "text-gray-500"}`}>List</button>
            <button onClick={() => setView("board")} className={`px-3 py-1.5 text-sm rounded-md ${view === "board" ? "bg-white shadow" : "text-gray-500"}`}>Board</button>
          </div>
          <button onClick={() => { setEditingTask(null); setShowModal(true); }} className="btn btn-primary">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
            className={`card p-3 text-center hover:shadow-md transition-all ${filterStatus === key ? "ring-2 ring-blue-500" : ""}`}
          >
            <p className={`text-2xl font-bold ${config.color}`}>{taskCounts[key as keyof typeof taskCounts]}</p>
            <p className="text-xs text-gray-500 mt-1">{config.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <select className="form-input text-sm" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">{filtered.length} of {tasks.length} tasks</span>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="card"><div className="card-body text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks found. Create your first task.</p>
            </div></div>
          ) : (
            filtered.map((task) => {
              const sc = statusConfig[task.status] || statusConfig.todo;
              const isExp = expandedTask === task.id;
              return (
                <div key={task.id} className="card">
                  <div className="card-body">
                    <div className="flex items-start gap-4">
                      {/* Status Column */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <button onClick={() => {
                          const order = ["todo", "in_progress", "review", "done"];
                          const idx = order.indexOf(task.status);
                          const next = task.status === "blocked" || task.status === "done" ? "todo" : order[Math.min(idx + 1, order.length - 1)];
                          quickStatusUpdate(task.id, next);
                        }} className={`w-10 h-10 rounded-full flex items-center justify-center ${sc.bg} ${sc.color} hover:scale-110 transition-transform`} title="Click to advance status">
                          {task.status === "done" ? <CheckCircle className="w-5 h-5" /> : task.status === "in_progress" ? <Clock className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <span className="text-[10px] text-gray-500">{sc.label}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-gray-900">{task.title}</span>
                          <span className={`badge ${sc.bg} ${sc.color} text-xs`}>{sc.label}</span>
                          <span className={`badge ${task.priority === "critical" ? "bg-red-100 text-red-600" : task.priority === "high" ? "bg-orange-100 text-orange-600" : task.priority === "medium" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"} text-xs`}>
                            {task.priority}
                          </span>
                          {task.relatedMilestone && (
                            <span className="badge badge-secondary text-xs flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {task.relatedMilestone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Assigned: <strong className="text-gray-700">{getMemberName(task.assignedTo)}</strong></span>
                          {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                          {task.estimatedHours && <span>{task.estimatedHours}h est.</span>}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="progress-bar w-20">
                            <div className="progress-bar-fill bg-blue-500" style={{ width: `${task.progress || 0}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{task.progress || 0}%</span>
                        </div>
                        <button onClick={() => setExpandedTask(isExp ? null : task.id)} className="text-xs text-blue-600 flex items-center gap-1 ml-auto">
                          {isExp ? "Hide" : "Details"} <ChevronDown className={`w-3 h-3 transition-transform ${isExp ? "rotate-180" : ""}`} />
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditingTask(task); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExp && (
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                          <p className="text-sm text-gray-600">{task.description || "No description"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                          <p className="text-sm text-gray-600">{task.notes || "No notes"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Update Progress</p>
                          <input type="range" min="0" max="100" value={parseInt(task.progress || "0")}
                            onChange={(e) => {
                              const p = e.target.value;
                              fetch(`/api/tasks/${task.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ progress: p }),
                              }).then(() => setTasks(tasks.map((t) => t.id === task.id ? { ...t, progress: p } : t)));
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Quick Status</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(statusConfig).map(([k, c]) => (
                              <button key={k} onClick={() => quickStatusUpdate(task.id, k)}
                                className={`px-2 py-1 text-xs rounded-md ${task.status === k ? `${c.bg} ${c.color} font-medium` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                {c.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        {task.tags?.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-xs font-medium text-gray-500 mb-1">Tags</p>
                            <div className="flex flex-wrap gap-1">{task.tags.map((t, i) => (<span key={i} className="badge badge-secondary text-xs">{t}</span>))}</div>
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
      )}

      {/* Board View */}
      {view === "board" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${config.color.replace("text-", "bg-")}`}></div>
                <h3 className="font-semibold text-sm text-gray-700">{config.label}</h3>
                <span className="text-xs text-gray-500">({tasks.filter((t) => t.status === key).length})</span>
              </div>
              {filtered.filter((t) => t.status === key).map((task) => (
                <div key={task.id} className="card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${task.priority === "critical" ? "bg-red-100 text-red-600" : task.priority === "high" ? "bg-orange-100 text-orange-600" : "bg-yellow-100 text-yellow-600"} text-[10px]`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{getMemberName(task.assignedTo)}</p>
                  {task.dueDate && <p className="text-xs text-gray-500 mb-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  <div className="flex items-center gap-2">
                    <div className="progress-bar flex-1">
                      <div className="progress-bar-fill bg-blue-500" style={{ width: `${task.progress || 0}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{task.progress || 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          members={members}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSave={(newTask) => {
            if (editingTask) {
              setTasks(tasks.map((t) => (t.id === editingTask.id ? { ...t, ...newTask } : t)));
            } else {
              const fullTask: Task = {
                id: Date.now(),
                projectId: parseInt(projectId),
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

function TaskModal({ task, members, onClose, onSave }: {
  task: Task | null;
  members: TeamMember[];
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
}) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assignedTo: task?.assignedTo?.toString() || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    estimatedHours: task?.estimatedHours || "",
    startDate: task?.startDate || "",
    dueDate: task?.dueDate || "",
    relatedMilestone: task?.relatedMilestone || "",
    progress: task?.progress || "0",
    notes: task?.notes || "",
    tags: (task?.tags || []).join(", "),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title) return;

    const payload = {
      title: formData.title,
      description: formData.description,
      assignedTo: formData.assignedTo ? parseInt(formData.assignedTo) : null,
      status: formData.status,
      priority: formData.priority,
      estimatedHours: formData.estimatedHours || null,
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
          body: JSON.stringify({ ...payload, projectId: parseInt(window.location.pathname.split("/").pop() || "0") }),
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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold">{task ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><Plus className="w-5 h-5 rotate-45" /></button>
        </div>
        <form onSubmit={handleSubmit} className="card-body space-y-4">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input type="text" className="form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <select className="form-input" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {members.map((m) => (<option key={m.id} value={m.id}>{m.name} - {m.role}</option>))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                {Object.entries(statusConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-input" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Est. Hours</label>
              <input type="number" className="form-input" value={formData.estimatedHours} onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })} step="0.5" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Related Milestone</label>
            <input type="text" className="form-input" value={formData.relatedMilestone} onChange={(e) => setFormData({ ...formData, relatedMilestone: e.target.value })} placeholder="e.g., Demo-1" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input form-textarea" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input type="text" className="form-input" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="frontend, bug" />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-input form-textarea" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
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
