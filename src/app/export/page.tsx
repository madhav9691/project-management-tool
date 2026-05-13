"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText, CheckCircle, Loader2, Users, FolderKanban, ListChecks, Building2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
  platforms: string[];
  projectPhase: string;
  plannedClosureDate: string | null;
  percentageCompletion: string;
  lastWeekProgress: string;
  thisWeekTarget: string;
  projectRisks: string;
  salesCoordinator: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assignedTo: number | null;
  status: string;
  priority: string;
  estimatedHours: string | null;
  startDate: string | null;
  dueDate: string | null;
  relatedMilestone: string | null;
  progress: string;
  notes: string;
  tags: string[];
  createdAt: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string | null;
  email: string | null;
  isAvailable: string | null;
  createdAt: string;
}

interface Client {
  id: number;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  country: string | null;
  createdAt: string;
}

export default function ExportPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "csv">("excel");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [projectsRes, tasksRes, membersRes, clientsRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/tasks"),
        fetch("/api/team-members"),
        fetch("/api/clients"),
      ]);

      const [projectsData, tasksData, membersData, clientsData] = await Promise.all([
        projectsRes.json(),
        tasksRes.json(),
        membersRes.json(),
        clientsRes.json(),
      ]);

      if (projectsData.success) setProjects(projectsData.data);
      if (tasksData.success) setTasks(tasksData.data);
      if (membersData.success) setMembers(membersData.data);
      if (clientsData.success) setClients(clientsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  function getMemberName(id: number | null) {
    if (!id) return "Unassigned";
    return members.find((m) => m.id === id)?.name || "Unknown";
  }

  function getProjectName(projectId: number) {
    return projects.find((p) => p.id === projectId)?.projectNo || "";
  }

  function exportProjects() {
    if (projects.length === 0) { alert("No projects to export"); return; }
    const data = projects.map((p) => ({
      "Project No": p.projectNo,
      "Project Name": p.projectName,
      "Platforms": (p.platforms || []).join(", "),
      "Phase": p.projectPhase,
      "Planned Closure": p.plannedClosureDate || "",
      "Completion %": p.percentageCompletion,
      "Last Week Progress": p.lastWeekProgress,
      "This Week Target": p.thisWeekTarget,
      "Project Risks": p.projectRisks,
      "Sales Coordinator": p.salesCoordinator,
      "Status": p.status,
      "Priority": p.priority,
    }));

    if (exportType === "csv") {
      downloadCSV(data, "projects_report");
    } else {
      downloadExcel(data, "projects_report");
    }
  }

  function exportTasks() {
    if (tasks.length === 0) { alert("No tasks to export"); return; }
    const data = tasks.map((t) => ({
      "Project": getProjectName(t.projectId),
      "Task Title": t.title,
      "Description": t.description,
      "Assigned To": getMemberName(t.assignedTo),
      "Status": t.status,
      "Priority": t.priority,
      "Est. Hours": t.estimatedHours || "",
      "Start Date": t.startDate || "",
      "Due Date": t.dueDate || "",
      "Milestone": t.relatedMilestone || "",
      "Progress %": t.progress,
      "Tags": (t.tags || []).join(", "),
      "Notes": t.notes,
    }));

    if (exportType === "csv") {
      downloadCSV(data, "tasks_report");
    } else {
      downloadExcel(data, "tasks_report");
    }
  }

  function exportClients() {
    if (clients.length === 0) { alert("No clients to export"); return; }
    const data = clients.map((c) => ({
      "Client Name": c.name,
      "Contact Person": c.contactPerson || "",
      "Email": c.email || "",
      "Phone": c.phone || "",
      "Company": c.company || "",
      "Website": c.website || "",
      "Country": c.country || "",
    }));

    if (exportType === "csv") {
      downloadCSV(data, "clients_report");
    } else {
      downloadExcel(data, "clients_report");
    }
  }

  function exportTeam() {
    if (members.length === 0) { alert("No team members to export"); return; }
    const data = members.map((m) => ({
      "Name": m.name,
      "Role": m.role || "",
      "Email": m.email || "",
      "Availability": m.isAvailable || "",
    }));

    if (exportType === "csv") {
      downloadCSV(data, "team_report");
    } else {
      downloadExcel(data, "team_report");
    }
  }

  function exportWeeklyReport() {
    if (projects.length === 0) { alert("No projects to export"); return; }
    const today = new Date();
    const data = projects.map((p) => ({
      "Project No": p.projectNo,
      "Project Name": p.projectName,
      "Phase": p.projectPhase,
      "Completion %": p.percentageCompletion,
      "Status": p.status,
      "Last Week Progress": p.lastWeekProgress,
      "This Week Target": p.thisWeekTarget,
      "Risks": p.projectRisks,
      "Coordinator": p.salesCoordinator,
      "Planned Closure": p.plannedClosureDate || "",
      "Priority": p.priority,
    }));

    const weekNum = getWeekNumber(today);
    const fileName = `weekly_report_${today.getFullYear()}_week_${weekNum}`;

    if (exportType === "csv") {
      downloadCSV(data, fileName);
    } else {
      downloadExcel(data, fileName);
    }
  }

  function exportAll() {
    try {
      if (exportType === "csv") {
        const data = [
          ...projects.map((p) => ({
            Type: "Project",
            "Project No": p.projectNo,
            "Name": p.projectName,
            "Phase": p.projectPhase,
            "Status": p.status,
            "Completion %": p.percentageCompletion,
            "Coordinator": p.salesCoordinator,
          })),
          ...tasks.map((t) => ({
            Type: "Task",
            "Project No": getProjectName(t.projectId),
            "Name": t.title,
            "Phase": "",
            "Status": t.status,
            "Completion %": t.progress,
            "Coordinator": getMemberName(t.assignedTo),
          })),
        ];
        downloadCSV(data, "full_report");
      } else {
        const wb = XLSX.utils.book_new();

        // Projects sheet
        const projectsData = projects.map((p) => ({
          "Project No": p.projectNo,
          "Project Name": p.projectName,
          "Platforms": (p.platforms || []).join(", "),
          "Phase": p.projectPhase,
          "Planned Closure": p.plannedClosureDate || "",
          "Completion %": p.percentageCompletion,
          "Last Week": p.lastWeekProgress,
          "This Week": p.thisWeekTarget,
          "Risks": p.projectRisks,
          "Coordinator": p.salesCoordinator,
          "Status": p.status,
          "Priority": p.priority,
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(projectsData), "Projects");

        // Tasks sheet
        const tasksData = tasks.map((t) => ({
          "Project": getProjectName(t.projectId),
          "Task": t.title,
          "Assigned To": getMemberName(t.assignedTo),
          "Status": t.status,
          "Priority": t.priority,
          "Progress %": t.progress,
          "Due Date": t.dueDate || "",
          "Milestone": t.relatedMilestone || "",
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tasksData), "Tasks");

        // Team sheet
        const teamData = members.map((m) => ({
          "Name": m.name,
          "Role": m.role || "",
          "Email": m.email || "",
          "Availability": m.isAvailable || "",
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamData), "Team");

        // Clients sheet
        const clientsData = clients.map((c) => ({
          "Name": c.name,
          "Contact": c.contactPerson || "",
          "Email": c.email || "",
          "Company": c.company || "",
          "Country": c.country || "",
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clientsData), "Clients");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout]), "full_report.xlsx");
      }
    } catch (err) {
      console.error("Full export error:", err);
      alert("Export failed: " + err);
    }
  }

  function downloadCSV(data: any[], fileName: string) {
    if (data.length === 0) { alert("No data to export"); return; }
    try {
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(","),
        ...data.map((row) =>
          headers.map((h) => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${fileName}.csv`);
    } catch (err) {
      console.error("CSV export error:", err);
      alert("Export failed: " + err);
    }
  }

  function downloadExcel(data: any[], fileName: string) {
    if (data.length === 0) { alert("No data to export"); return; }
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");

      // Auto-width columns
      const colWidths = Object.keys(data[0]).map((key) => ({
        wch: Math.max(
          key.length,
          ...data.map((row) => String(row[key] || "").length)
        ) + 2,
      }));
      ws["!cols"] = colWidths;

      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout]), `${fileName}.xlsx`);
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Export failed: " + err);
    }
  }

  function getWeekNumber(d: Date) {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Export Reports</h1>
          <p className="text-gray-500 mt-1">Download your project data as Excel or CSV</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setExportType("excel")}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 ${exportType === "excel" ? "bg-white shadow" : "text-gray-500"}`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={() => setExportType("csv")}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1 ${exportType === "csv" ? "bg-white shadow" : "text-gray-500"}`}
          >
            <FileText className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Projects Report</h3>
            <p className="text-sm text-gray-500 mb-4">{projects.length} projects</p>
            <button
              onClick={exportProjects}
              disabled={exporting}
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Tasks */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
              <ListChecks className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tasks Report</h3>
            <p className="text-sm text-gray-500 mb-4">{tasks.length} tasks</p>
            <button
              onClick={exportTasks}
              disabled={exporting}
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Clients */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Clients Report</h3>
            <p className="text-sm text-gray-500 mb-4">{clients.length} clients</p>
            <button
              onClick={exportClients}
              disabled={exporting}
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Team */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Team Report</h3>
            <p className="text-sm text-gray-500 mb-4">{members.length} members</p>
            <button
              onClick={exportTeam}
              disabled={exporting}
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Weekly Report */}
        <div className="card hover:shadow-lg transition-shadow border-2 border-blue-200">
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Weekly Status Report</h3>
            <p className="text-sm text-gray-500 mb-4">Week {getWeekNumber(new Date())}</p>
            <button
              onClick={exportWeeklyReport}
              disabled={exporting}
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Full Report */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="card-body text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Full Report</h3>
            <p className="text-sm text-gray-500 mb-4">All data in one file</p>
            <button
              onClick={exportAll}
              disabled={exporting}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" /> Export All
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card mt-6">
        <div className="card-body">
          <h3 className="font-semibold text-gray-900 mb-2">Export Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700 mb-1">Excel (.xlsx)</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Formatted spreadsheet with column widths</li>
                <li>Multiple sheets for Full Report</li>
                <li>Compatible with Microsoft Excel & Google Sheets</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">CSV (.csv)</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Plain text format</li>
                <li>Compatible with all spreadsheet software</li>
                <li>Easy to import into other systems</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
