"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Eye,
  FileSpreadsheet,
  CheckCircle,
  Users,
} from "lucide-react";

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
  platforms: string[];
  primaryResources: { name: string; role: string }[];
  projectPhase: string;
  projectTracker: string;
  plannedClosureDate: string | null;
  salesMilestones: { name: string; percentage: number }[];
  operationalMilestones: string[];
  percentageCompletion: string;
  lastWeekProgress: string;
  thisWeekTarget: string;
  projectRisks: string;
  salesCoordinator: string;
  status: string;
  priority: string;
  createdAt: string;
}

const phases = ["Planning", "Designs", "Coding", "QAQC", "UAT", "Live"];
const statuses = ["active", "onhold", "completed", "cancelled"];
const priorities = ["low", "medium", "high", "critical"];

type SortField = "projectNo" | "projectName" | "projectPhase" | "percentageCompletion" | "plannedClosureDate" | "status" | "priority";
type SortDirection = "asc" | "desc";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("projectNo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("compact");

  useEffect(() => {
    fetchProjects();
  }, [search, phaseFilter, statusFilter, priorityFilter]);

  async function fetchProjects() {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (phaseFilter) params.append("phase", phaseFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      if (data.success) {
        let filtered = data.data;

        if (priorityFilter) {
          filtered = filtered.filter((p: Project) => p.priority === priorityFilter);
        }

        filtered.sort((a: Project, b: Project) => {
          let aVal: string | number = "";
          let bVal: string | number = "";

          switch (sortField) {
            case "projectNo":
              aVal = a.projectNo;
              bVal = b.projectNo;
              break;
            case "projectName":
              aVal = a.projectName.toLowerCase();
              bVal = b.projectName.toLowerCase();
              break;
            case "projectPhase":
              aVal = a.projectPhase;
              bVal = b.projectPhase;
              break;
            case "percentageCompletion":
              aVal = parseFloat(a.percentageCompletion || "0");
              bVal = parseFloat(b.percentageCompletion || "0");
              break;
            case "plannedClosureDate":
              aVal = a.plannedClosureDate || "";
              bVal = b.plannedClosureDate || "";
              break;
            case "status":
              aVal = a.status;
              bVal = b.status;
              break;
            case "priority":
              const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
              aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
              bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
              break;
          }

          if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
          if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
          return 0;
        });

        setProjects(filtered);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProject(id: number) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function toggleRow(id: number) {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  }

  function getPhaseBadgeClass(phase: string) {
    const classes: Record<string, string> = {
      Planning: "badge-secondary",
      Designs: "badge-primary",
      Coding: "badge-primary",
      QAQC: "badge-warning",
      UAT: "badge-warning",
      Live: "badge-success",
    };
    return classes[phase] || "badge-secondary";
  }

  function getStatusBadgeClass(status: string) {
    const classes: Record<string, string> = {
      active: "badge-success",
      onhold: "badge-warning",
      completed: "badge-primary",
      cancelled: "badge-danger",
    };
    return classes[status] || "badge-secondary";
  }

  function getPriorityBadgeClass(priority: string) {
    const classes: Record<string, string> = {
      low: "badge-success",
      medium: "badge-secondary",
      high: "badge-warning",
      critical: "badge-danger",
    };
    return classes[priority] || "badge-secondary";
  }

  function getProgressColor(percentage: number) {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function isOverdue(dateStr: string | null, percentage: string) {
    if (!dateStr || parseFloat(percentage) >= 100) return false;
    return new Date(dateStr) < new Date();
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your projects — like your spreadsheet, but better
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tasks" className="btn btn-secondary">
            <CheckCircle className="w-4 h-4" /> All Tasks
          </Link>
          <Link href="/portal" className="btn btn-secondary">
            <Users className="w-4 h-4" /> Resource Portal
          </Link>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("compact")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                viewMode === "compact" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Compact
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                viewMode === "detailed" ? "bg-white shadow text-gray-900" : "text-gray-500"
              }`}
            >
              Detailed
            </button>
          </div>
          <Link href="/projects/new" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name or number..."
                className="form-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn ${showFilters ? "btn-primary" : "btn-secondary"}`}
            >
              <Filter className="w-4 h-4" />
              Filters {showFilters ? "×" : ""}
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileSpreadsheet className="w-4 h-4" />
              {projects.length} projects
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <label className="form-label">Phase</label>
                <select
                  className="form-input"
                  value={phaseFilter}
                  onChange={(e) => setPhaseFilter(e.target.value)}
                >
                  <option value="">All Phases</option>
                  {phases.map((phase) => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select
                  className="form-input"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  {priorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setPhaseFilter("");
                    setStatusFilter("");
                    setPriorityFilter("");
                  }}
                  className="btn btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects Table - Compact View */}
      {viewMode === "compact" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto" style={{ maxWidth: "calc(100vw - 16rem - 3rem)" }}>
            <table className="data-table" style={{ minWidth: "1200px" }}>
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-8"></th>
                  <th onClick={() => handleSort("projectNo")} className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-1">
                      Project No
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort("projectName")} className="cursor-pointer hover:bg-slate-100 min-w-[200px]">
                    <div className="flex items-center gap-1">
                      Project Name
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="min-w-[120px]">Platforms</th>
                  <th onClick={() => handleSort("projectPhase")} className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-1">
                      Phase
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="min-w-[180px]">Resources</th>
                  <th onClick={() => handleSort("plannedClosureDate")} className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-1">
                      Closure Date
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort("percentageCompletion")} className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-1">
                      Completion
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="min-w-[150px]">Last Week</th>
                  <th className="min-w-[150px]">This Week</th>
                  <th className="min-w-[120px]">Risks</th>
                  <th>Coordinator</th>
                  <th onClick={() => handleSort("status")} className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-1">
                      Status
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th onClick={() => handleSort("priority")} className="cursor-pointer hover:bg-slate-100">
                    <div className="flex items-center gap-1">
                      Priority
                      <ArrowUpDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={15} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="spinner"></div>
                        <span className="text-gray-500">Loading projects...</span>
                      </div>
                    </td>
                  </tr>
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="text-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <FileSpreadsheet className="w-12 h-12 text-gray-300" />
                        <p className="text-gray-500">No projects found</p>
                        <Link href="/projects/new" className="btn btn-primary btn-sm">
                          <Plus className="w-4 h-4" />
                          Create First Project
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projects.map((project) => (
                    <tr key={project.id} className={isOverdue(project.plannedClosureDate, project.percentageCompletion) ? "bg-red-50/50" : ""}>
                      <td>
                        <button
                          onClick={() => toggleRow(project.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedRows.has(project.id) ? (
                            <ChevronLeft className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td>
                        <Link href={`/projects/${project.id}`} className="font-semibold text-blue-600 hover:text-blue-700">
                          {project.projectNo}
                        </Link>
                      </td>
                      <td>
                        <div className="font-medium text-gray-900">{project.projectName}</div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(project.platforms || []).slice(0, 2).map((p) => (
                            <span key={p} className="badge badge-secondary text-[10px] px-1.5 py-0.5">
                              {p}
                            </span>
                          ))}
                          {(project.platforms || []).length > 2 && (
                            <span className="badge badge-secondary text-[10px] px-1.5 py-0.5">
                              +{project.platforms.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getPhaseBadgeClass(project.projectPhase)}`}>
                          {project.projectPhase}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs text-gray-600 max-w-[180px]">
                          {(project.primaryResources || []).slice(0, 2).map((r, i) => (
                            <div key={i} className="truncate">{r.name} - {r.role}</div>
                          ))}
                          {(project.primaryResources || []).length > 2 && (
                            <div className="text-gray-400">+{(project.primaryResources || []).length - 2} more</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className={`text-xs ${isOverdue(project.plannedClosureDate, project.percentageCompletion) ? "text-red-600 font-medium" : "text-gray-600"}`}>
                          {formatDate(project.plannedClosureDate)}
                          {isOverdue(project.plannedClosureDate, project.percentageCompletion) && (
                            <span className="text-red-500 ml-1">⚠</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-16">
                            <div
                              className={`progress-bar-fill ${getProgressColor(parseFloat(project.percentageCompletion || "0"))}`}
                              style={{ width: `${parseFloat(project.percentageCompletion || "0")}%` }}
                            ></div>
                          </div>
                          <span className={`text-xs font-medium ${parseFloat(project.percentageCompletion || "0") === 100 ? "text-green-600" : "text-gray-500"}`}>
                            {parseFloat(project.percentageCompletion || "0")}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-600 max-w-[150px] truncate" title={project.lastWeekProgress}>
                          {project.lastWeekProgress || "-"}
                        </div>
                      </td>
                      <td>
                        <div className="text-xs text-gray-600 max-w-[150px] truncate" title={project.thisWeekTarget}>
                          {project.thisWeekTarget || "-"}
                        </div>
                      </td>
                      <td>
                        {project.projectRisks ? (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            <span className="max-w-[100px] truncate">{project.projectRisks}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td>
                        <span className="text-xs text-gray-600">{project.salesCoordinator || "-"}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(project.status)}`}>{project.status}</span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>{project.priority}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link href={`/projects/${project.id}`} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/projects/${project.id}`} className="p-1 text-gray-400 hover:text-gray-600 rounded" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => deleteProject(project.id)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Table - Detailed View */}
      {viewMode === "detailed" && (
        <div className="space-y-4">
          {loading ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <div className="spinner"></div>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No projects found</p>
              </div>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className={`card ${isOverdue(project.plannedClosureDate, project.percentageCompletion) ? "border-red-200" : ""}`}>
                <div className="card-body">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{project.projectNo.replace("P", "")}</span>
                      </div>
                      <div>
                        <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {project.projectName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`badge ${getPhaseBadgeClass(project.projectPhase)}`}>{project.projectPhase}</span>
                          <span className={`badge ${getStatusBadgeClass(project.status)}`}>{project.status}</span>
                          <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>{project.priority}</span>
                          {isOverdue(project.plannedClosureDate, project.percentageCompletion) && (
                            <span className="badge badge-danger flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/projects/${project.id}`} className="btn btn-secondary text-xs py-1.5 px-3">
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button onClick={() => deleteProject(project.id)} className="btn btn-secondary text-xs py-1.5 px-3 text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Platforms & Resources */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Platforms</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(project.platforms || []).map((p) => (
                          <span key={p} className="badge badge-secondary text-xs">{p}</span>
                        ))}
                      </div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Team</p>
                      <div className="space-y-1">
                        {(project.primaryResources || []).slice(0, 4).map((r, i) => (
                          <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">
                              {r.name.charAt(0)}
                            </span>
                            <span className="truncate">{r.name}</span>
                            <span className="text-gray-400 text-xs">({r.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dates & Progress */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Timeline</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Planned:</span>
                          <span className={`font-medium ${isOverdue(project.plannedClosureDate, project.percentageCompletion) ? "text-red-600" : "text-gray-900"}`}>
                            {formatDate(project.plannedClosureDate)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-medium text-gray-500 mb-2 mt-4 uppercase tracking-wide">Progress</p>
                      <div className="flex items-center gap-3">
                        <div className="progress-bar flex-1">
                          <div
                            className={`progress-bar-fill ${getProgressColor(parseFloat(project.percentageCompletion || "0"))}`}
                            style={{ width: `${parseFloat(project.percentageCompletion || "0")}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">{parseFloat(project.percentageCompletion || "0")}%</span>
                      </div>
                    </div>

                    {/* Sales Milestones */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Sales Milestones</p>
                      <div className="space-y-2">
                        {(project.salesMilestones || []).map((m, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="progress-bar w-20">
                              <div
                                className="progress-bar-fill bg-green-500"
                                style={{ width: `${m.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-700">{m.name}</span>
                            <span className="text-xs text-gray-500">{m.percentage}%</span>
                          </div>
                        ))}
                        {(!project.salesMilestones || project.salesMilestones.length === 0) && (
                          <p className="text-sm text-gray-400">No milestones set</p>
                        )}
                      </div>
                    </div>

                    {/* Operational Milestones & Coordinator */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Operational Milestones</p>
                      <div className="space-y-1">
                        {(project.operationalMilestones || []).map((m, i) => (
                          <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                            {m}
                          </div>
                        ))}
                        {(!project.operationalMilestones || project.operationalMilestones.length === 0) && (
                          <p className="text-sm text-gray-400">No milestones set</p>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-500 mb-2 mt-3 uppercase tracking-wide">Coordinator</p>
                      <p className="text-sm text-gray-700">{project.salesCoordinator || "-"}</p>
                    </div>
                  </div>

                  {/* Progress Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Last Week Progress</p>
                      <p className="text-sm text-gray-600">{project.lastWeekProgress || "No updates yet"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">This Week Target</p>
                      <p className="text-sm text-gray-600">{project.thisWeekTarget || "No targets set"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Project Risks</p>
                      {project.projectRisks ? (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-700">{project.projectRisks}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No risks identified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500 px-2">
        <span>Showing {projects.length} of {projects.length} project(s)</span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Active: <strong className="text-green-600">{projects.filter((p) => p.status === "active").length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Completed: <strong className="text-blue-600">{projects.filter((p) => p.status === "completed").length}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              On Hold: <strong className="text-orange-600">{projects.filter((p) => p.status === "onhold").length}</strong>
            </span>
          </div>
          {projects.some((p) => isOverdue(p.plannedClosureDate, p.percentageCompletion)) && (
            <span className="flex items-center gap-1.5 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <strong>{projects.filter((p) => isOverdue(p.plannedClosureDate, p.percentageCompletion)).length}</strong> overdue
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
