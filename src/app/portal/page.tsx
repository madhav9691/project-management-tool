"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Play,
  MessageSquare,
  BarChart3,
  Calendar,
  Timer,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";

interface TeamMember {
  id: number;
  name: string;
  role: string | null;
  email: string | null;
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

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
}

const taskStatusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  todo: {
    label: "To Do",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: <Clock className="w-3 h-3" />,
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: <Play className="w-3 h-3" />,
  },
  review: {
    label: "In Review",
    color: "text-purple-600",
    bg: "bg-purple-100",
    icon: <Eye className="w-3 h-3" />,
  },
  done: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  blocked: {
    label: "Blocked",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  low: { label: "Low", color: "text-green-600", bg: "bg-green-100" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-100" },
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-100" },
};

export default function ResourcePortal() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Set<number>>(new Set());
  const [view, setView] = useState<"list" | "kanban">("list");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedMember) {
      fetchTasks();
    }
  }, [selectedMember]);

  async function fetchTeamMembers() {
    try {
      const res = await fetch("/api/team-members");
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    if (!selectedMember) return;

    try {
      const res = await fetch(`/api/tasks?assignedTo=${selectedMember}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  async function updateTaskStatus(taskId: number, newStatus: string) {
    setUpdatingStatus((prev) => new Set(prev).add(taskId));

    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      if (newStatus === "done") {
        updateData.completedDate = new Date().toISOString().split("T")[0];
        updateData.progress = "100";
      }
      if (newStatus === "in_progress" && !tasks.find((t) => t.id === taskId)?.startDate) {
        updateData.startDate = new Date().toISOString().split("T")[0];
      }

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, ...updateData } : t)));
      }
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingStatus((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  }

  async function updateTaskProgress(taskId: number, progress: number) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: progress.toString() }),
      });

      const data = await res.json();
      if (data.success) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, progress: progress.toString() } : t)));
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  }

  function getFilteredTasks() {
    return tasks.filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) return false;
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      return true;
    });
  }

  function getProjectName(projectId: number) {
    const project = projects.find((p) => p.id === projectId);
    return project ? `${project.projectNo} - ${project.projectName}` : "Unknown Project";
  }

  function getProjectShortName(projectId: number) {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.projectNo : "";
  }

  function isOverdue(dueDate: string | null, status: string) {
    if (!dueDate || status === "done") return false;
    return new Date(dueDate) < new Date();
  }

  function getMemberName(memberId: number | null) {
    if (!memberId) return "Unassigned";
    const member = teamMembers.find((m) => m.id === memberId);
    return member ? member.name : "Unknown";
  }

  const filteredTasks = getFilteredTasks();
  const selectedMemberData = teamMembers.find((m) => m.id === selectedMember);

  // Stats
  const todoTasks = tasks.filter((t) => t.status === "todo").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const reviewTasks = tasks.filter((t) => t.status === "review").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;
  const blockedTasks = tasks.filter((t) => t.status === "blocked").length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Portal</h1>
          <p className="text-gray-500 mt-1">View your assigned tasks and track progress</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${view === "list" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${view === "kanban" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}
            >
              Board
            </button>
          </div>
        </div>
      </div>

      {/* Team Member Selector */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 min-w-[280px]"
              >
                {selectedMemberData ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                      {selectedMemberData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedMemberData.name}</p>
                      <p className="text-sm text-gray-500">{selectedMemberData.role || "Team Member"}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Filter className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Select your name</p>
                      <p className="text-sm text-gray-500">Choose from team members</p>
                    </div>
                  </div>
                )}
                <ChevronDown className="w-5 h-5 text-gray-400 ml-auto" />
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member.id);
                        setShowDropdown(false);
                      }}
                      className={`flex items-center gap-3 w-full p-3 hover:bg-gray-50 text-left ${selectedMember === member.id ? "bg-blue-50" : ""}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role || "Team Member"}</p>
                      </div>
                      {selectedMember === member.id && (
                        <CheckCircle className="w-4 h-4 text-blue-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedMember && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  <strong className="text-gray-900">{filteredTasks.length}</strong> tasks
                </span>
                <span className="text-sm text-gray-500">
                  <strong className="text-orange-600">{overdueTasks}</strong> overdue
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {!selectedMember ? (
        <div className="card">
          <div className="card-body text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select your name to continue</h3>
            <p className="text-gray-500">Choose your name from the dropdown above to view your assigned tasks</p>
          </div>
        </div>
      ) : (
        <>
          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="card">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-gray-400">{todoTasks}</p>
                <p className="text-xs text-gray-500 mt-1">To Do</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                <p className="text-xs text-gray-500 mt-1">In Progress</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{reviewTasks}</p>
                <p className="text-xs text-gray-500 mt-1">In Review</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{doneTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{blockedTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Blocked</p>
              </div>
            </div>
            <div className="card">
              <div className="card-body p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{overdueTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Overdue</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
              <select
                className="form-input text-sm py-1.5"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
              <select
                className="form-input text-sm py-1.5"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* List View */}
          {view === "list" && (
            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500">You don't have any tasks matching the current filters</p>
                  </div>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const statusConfig = taskStatusConfig[task.status] || taskStatusConfig.todo;
                  const priorityConfigItem = priorityConfig[task.priority] || priorityConfig.medium;
                  const isTaskOverdue = isOverdue(task.dueDate, task.status);
                  const isExpanded = expandedTask === task.id;
                  const isUpdating = updatingStatus.has(task.id);

                  return (
                    <div key={task.id} className={`card ${isTaskOverdue ? "border-red-200" : ""}`}>
                      <div className="card-body">
                        {/* Task Header */}
                        <div className="flex items-start gap-4">
                          {/* Status Toggle */}
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => {
                                const statusOrder = ["todo", "in_progress", "review", "done"];
                                const currentIndex = statusOrder.indexOf(task.status);
                                const nextStatus = currentIndex < statusOrder.length - 1 ? statusOrder[currentIndex + 1] : "todo";
                                if (task.status === "blocked" || task.status === "done") {
                                  // If blocked or done, go to todo
                                  updateTaskStatus(task.id, "todo");
                                } else {
                                  updateTaskStatus(task.id, nextStatus);
                                }
                              }}
                              disabled={isUpdating}
                              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                              style={{
                                background: statusConfig.bg,
                              }}
                              title={`Current: ${statusConfig.label}. Click to advance status`}
                            >
                              {isUpdating ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color: statusConfig.color }} />
                              ) : (
                                <span className={statusConfig.color}>{statusConfig.icon}</span>
                              )}
                            </button>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">{statusConfig.label}</span>
                          </div>

                          {/* Task Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm font-semibold text-gray-900">{task.title}</span>
                              <span className={`badge ${statusConfig.bg} ${statusConfig.color} text-xs`}>
                                {statusConfig.label}
                              </span>
                              <span className={`badge ${priorityConfigItem.bg} ${priorityConfigItem.color} text-xs`}>
                                {priorityConfigItem.label}
                              </span>
                              {isTaskOverdue && (
                                <span className="badge bg-red-100 text-red-600 text-xs flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Overdue
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{getProjectShortName(task.projectId)}</span>
                              {task.relatedMilestone && <span>• Milestone: {task.relatedMilestone}</span>}
                              {task.dueDate && (
                                <span className={isTaskOverdue ? "text-red-600 font-medium" : ""}>
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              {task.estimatedHours && (
                                <span className="flex items-center gap-1">
                                  <Timer className="w-3 h-3" /> {task.estimatedHours}h est.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress & Expand */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <div className="progress-bar w-20">
                                  <div
                                    className="progress-bar-fill bg-blue-500"
                                    style={{ width: `${task.progress || 0}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{task.progress || 0}%</span>
                              </div>
                              <button
                                onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 mt-1 flex items-center gap-1"
                              >
                                {isExpanded ? "Less" : "More"} <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                              <p className="text-sm text-gray-600">{task.description || "No description provided"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                              <p className="text-sm text-gray-600">{task.notes || "No notes"}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Update Progress</p>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={parseInt(task.progress || "0")}
                                  onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                                  className="flex-1"
                                />
                                <span className="text-sm font-medium text-gray-700 w-12">{task.progress || 0}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Quick Status Change</p>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(taskStatusConfig).map(([key, config]) => (
                                  <button
                                    key={key}
                                    onClick={() => updateTaskStatus(task.id, key)}
                                    disabled={isUpdating}
                                    className={`px-2 py-1 text-xs rounded-md transition-all ${task.status === key ? `${config.bg} ${config.color} font-medium` : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                  >
                                    {config.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {task.tags && task.tags.length > 0 && (
                              <div className="md:col-span-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Tags</p>
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.map((tag, i) => (
                                    <span key={i} className="badge badge-secondary text-xs">{tag}</span>
                                  ))}
                                </div>
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

          {/* Kanban View */}
          {view === "kanban" && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(taskStatusConfig).map(([statusKey, config]) => {
                const statusTasks = filteredTasks.filter((t) => t.status === statusKey);
                return (
                  <div key={statusKey} className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-3 h-3 rounded-full ${config.bg.replace("bg-", "bg-")}`} style={{ backgroundColor: config.color.includes("text-") ? config.color.replace("text-", "bg-") : "#ccc" }}></div>
                      <h3 className="font-semibold text-gray-700 text-sm">{config.label}</h3>
                      <span className="text-xs text-gray-500">({statusTasks.length})</span>
                    </div>
                    {statusTasks.map((task) => {
                      const priorityConfigItem = priorityConfig[task.priority] || priorityConfig.medium;
                      const isTaskOverdue = isOverdue(task.dueDate, task.status);
                      return (
                        <div key={task.id} className={`card p-3 ${isTaskOverdue ? "border-red-200" : ""}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`badge ${priorityConfigItem.bg} ${priorityConfigItem.color} text-[10px]`}>
                              {priorityConfigItem.label}
                            </span>
                            {isTaskOverdue && <AlertCircle className="w-3 h-3 text-red-500" />}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</p>
                          <p className="text-xs text-gray-500 mb-2">{getProjectShortName(task.projectId)}</p>
                          {task.dueDate && (
                            <p className={`text-xs ${isTaskOverdue ? "text-red-600" : "text-gray-500"} mb-2`}>
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="progress-bar w-16">
                              <div className="progress-bar-fill bg-blue-500" style={{ width: `${task.progress || 0}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500">{task.progress || 0}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
