"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
  projectPhase: string;
  percentageCompletion: string;
  status: string;
  priority: string;
  lastWeekProgress: string;
  thisWeekTarget: string;
  projectRisks: string;
  salesCoordinator: string;
  plannedClosureDate: string | null;
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("weekly");

  useEffect(() => {
    fetchProjects();
  }, []);

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

  function getWeekNumber(date: Date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();

  function exportToCSV() {
    const headers = [
      "Project No",
      "Project Name",
      "Phase",
      "Progress %",
      "Status",
      "Priority",
      "Last Week Progress",
      "This Week Target",
      "Risks",
      "Coordinator",
      "Planned Closure",
    ];

    const rows = projects.map((p) => [
      p.projectNo,
      p.projectName,
      p.projectPhase,
      p.percentageCompletion,
      p.status,
      p.priority,
      p.lastWeekProgress?.replace(/"/g, '""') || "",
      p.thisWeekTarget?.replace(/"/g, '""') || "",
      p.projectRisks?.replace(/"/g, '""') || "",
      p.salesCoordinator || "",
      p.plannedClosureDate || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-report-${currentYear}-week-${currentWeek}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const activeProjects = projects.filter((p) => p.status === "active");
  const completedProjects = projects.filter((p) => p.status === "completed");
  const atRiskProjects = projects.filter(
    (p) => p.projectRisks && p.projectRisks.length > 0
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            Generate and export project reports
          </p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary">
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      {/* Report Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeProjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedProjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {atRiskProjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Report */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Weekly Status Report - Week {currentWeek}, {currentYear}
          </h2>
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
                  <th>Last Week</th>
                  <th>This Week Target</th>
                  <th>Risks/Blockers</th>
                  <th>Coordinator</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="spinner"></div>
                      </div>
                    </td>
                  </tr>
                ) : activeProjects.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No active projects
                    </td>
                  </tr>
                ) : (
                  activeProjects.map((project) => (
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
                          <div className="progress-bar w-20">
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
                        <div className="max-w-[150px] text-sm text-gray-600 truncate">
                          {project.lastWeekProgress || "-"}
                        </div>
                      </td>
                      <td>
                        <div className="max-w-[150px] text-sm text-gray-600 truncate">
                          {project.thisWeekTarget || "-"}
                        </div>
                      </td>
                      <td>
                        <div className="max-w-[150px] text-sm text-orange-600 truncate">
                          {project.projectRisks || "-"}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {project.salesCoordinator || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Phase Summary */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">
            Projects by Phase
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Planning", "Designs", "Coding", "QAQC", "UAT", "Live"].map(
              (phase) => {
                const count = projects.filter(
                  (p) => p.projectPhase === phase
                ).length;
                return (
                  <div
                    key={phase}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-500 mt-1">{phase}</p>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
