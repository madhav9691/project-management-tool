"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderKanban,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Users,
  Building2,
  ListChecks,
  Eye,
  Send,
  Upload,
  Download,
} from "lucide-react";

interface Stats {
  totalProjects: number;
  byPhase: { phase: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  avgCompletion: number;
  completedProjects: number;
  atRiskProjects: number;
  activeProjects: number;
}

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
  projectPhase: string;
  percentageCompletion: string;
  status: string;
  priority: string;
  plannedClosureDate: string | null;
  createdAt: string;
}

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  blocked: number;
  overdue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/projects"),
          fetch("/api/tasks"),
        ]);

        const statsData = await statsRes.json();
        const projectsData = await projectsRes.json();
        const tasksData = await tasksRes.json();

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (projectsData.success) {
          setRecentProjects(projectsData.data.slice(0, 5));
        }

        if (tasksData.success) {
          const tasks = tasksData.data;
          setTaskStats({
            total: tasks.length,
            todo: tasks.filter((t: any) => t.status === "todo").length,
            inProgress: tasks.filter((t: any) => t.status === "in_progress").length,
            review: tasks.filter((t: any) => t.status === "review").length,
            done: tasks.filter((t: any) => t.status === "done").length,
            blocked: tasks.filter((t: any) => t.status === "blocked").length,
            overdue: tasks.filter((t: any) => {
              if (!t.dueDate || t.status === "done") return false;
              return new Date(t.dueDate) < new Date();
            }).length,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your project management platform
          </p>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.totalProjects || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">
                {stats?.activeProjects || 0}
              </span>
              <span className="ml-1">active</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats?.completedProjects || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="progress-bar">
                <div
                  className="progress-bar-fill bg-green-500"
                  style={{
                    width: `${
                      stats && stats.totalProjects > 0
                        ? (stats.completedProjects / stats.totalProjects) * 100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {stats && stats.totalProjects > 0
                  ? Math.round(
                      (stats.completedProjects / stats.totalProjects) * 100
                    )
                  : 0}
                % completion rate
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {taskStats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="text-green-500 font-medium">
                {taskStats?.done || 0}
              </span>
              <span className="ml-1">completed</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {taskStats?.inProgress || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span className="text-red-500 font-medium">
                {taskStats?.overdue || 0}
              </span>
              <span className="ml-1">overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projects by Phase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Projects by Phase
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {stats?.byPhase.map((item) => (
                <div key={item.phase}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {item.phase}
                    </span>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill bg-blue-500"
                      style={{
                        width: `${
                          stats && stats.totalProjects > 0
                            ? (item.count / stats.totalProjects) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {!stats?.byPhase.length && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No projects yet
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Projects by Priority
            </h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {stats?.byPriority.map((item) => (
                <div key={item.priority}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          item.priority === "critical"
                            ? "bg-red-500"
                            : item.priority === "high"
                            ? "bg-orange-500"
                            : item.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></span>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {item.priority}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${
                        item.priority === "critical"
                          ? "bg-red-500"
                          : item.priority === "high"
                          ? "bg-orange-500"
                          : item.priority === "medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${
                          stats && stats.totalProjects > 0
                            ? (item.count / stats.totalProjects) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {!stats?.byPriority.length && (
                <p className="text-sm text-gray-500 text-center py-4">
                  No projects yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/assign" className="card hover:shadow-lg transition-shadow group border-2 border-blue-200">
          <div className="card-body flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center group-hover:bg-blue-700 transition-colors">
              <Send className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign Tasks</h3>
              <p className="text-sm text-gray-500">Select project → Pick resource → Create task</p>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-600 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/import" className="card hover:shadow-lg transition-shadow group">
          <div className="card-body flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Upload className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Import Excel</h3>
              <p className="text-sm text-gray-500">Bulk import from spreadsheet</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-600 transition-colors" />
          </div>
        </Link>
        <Link href="/export" className="card hover:shadow-lg transition-shadow group">
          <div className="card-body flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Download className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-500">Download Excel or CSV reports</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Task Status Overview */}
      {taskStats && taskStats.total > 0 && (
        <div className="card mb-8">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Task Overview</h2>
            <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Manage tasks <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">{taskStats.todo}</p>
                <p className="text-xs text-gray-500">To Do</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{taskStats.review}</p>
                <p className="text-xs text-gray-500">In Review</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{taskStats.done}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{taskStats.blocked}</p>
                <p className="text-xs text-gray-500">Blocked</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project No</th>
                  <th>Project Name</th>
                  <th>Phase</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="font-medium text-blue-600">
                      {project.projectNo}
                    </td>
                    <td>{project.projectName}</td>
                    <td>
                      <span className="badge badge-secondary">
                        {project.projectPhase}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-24">
                          <div
                            className="progress-bar-fill bg-blue-500"
                            style={{
                              width: `${parseFloat(
                                project.percentageCompletion || "0"
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {parseFloat(project.percentageCompletion || "0")}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          project.status === "active"
                            ? "badge-success"
                            : project.status === "completed"
                            ? "badge-primary"
                            : "badge-warning"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          project.priority === "critical"
                            ? "badge-danger"
                            : project.priority === "high"
                            ? "badge-warning"
                            : project.priority === "medium"
                            ? "badge-secondary"
                            : "badge-success"
                        }`}
                      >
                        {project.priority}
                      </span>
                    </td>
                  </tr>
                ))}
                {!recentProjects.length && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No projects yet. Create your first project to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
