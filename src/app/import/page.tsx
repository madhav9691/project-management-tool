"use client";

import { useState, useRef } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface ImportResult {
  success: boolean;
  inserted: number;
  errors: string[];
  message: string;
}

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState("projects");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setResult(null);
      parseFile(selectedFile);
    }
  }

  function parseFile(selectedFile: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        setPreviewData(jsonData);
        setShowPreview(true);
      } catch (err) {
        setError("Failed to parse file. Please check the format.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  }

  function prepareDataForImport(data: any[]) {
    switch (importType) {
      case "projects":
        return data.map((row: any) => ({
          projectNo: row["Project No"] || row["projectNo"] || row["ProjectNo"] || row["PROJECT_NO"] || "",
          projectName: row["Project Name"] || row["projectName"] || row["ProjectName"] || row["PROJECT_NAME"] || "",
          platforms: row["Platforms"] || row["platforms"] || row["Platforms"] || [],
          projectPhase: row["Project Phase"] || row["projectPhase"] || row["Phase"] || "Planning",
          projectTracker: row["Project Tracker"] || row["projectTracker"] || "",
          plannedClosureDate: row["Planned Closure Date"] || row["plannedClosureDate"] || row["Closure Date"] || null,
          percentageCompletion: row["Completion %"] || row["percentageCompletion"] || row["Progress"] || "0",
          lastWeekProgress: row["Last Week Progress"] || row["lastWeekProgress"] || "",
          thisWeekTarget: row["This Week Target"] || row["thisWeekTarget"] || "",
          projectRisks: row["Project Risks"] || row["projectRisks"] || "",
          salesCoordinator: row["Sales Coordinator"] || row["salesCoordinator"] || "",
          status: row["Status"] || "active",
          priority: row["Priority"] || "medium",
        }));

      case "tasks":
        return data.map((row: any) => ({
          projectId: row["Project ID"] || row["projectId"] || row["ProjectId"] || parseInt(row["Project No"]?.replace("P", "")) || null,
          title: row["Task Title"] || row["title"] || row["Task"] || "",
          description: row["Description"] || row["description"] || "",
          assignedTo: row["Assigned To ID"] || row["assignedTo"] || null,
          status: row["Status"] || "todo",
          priority: row["Priority"] || "medium",
          estimatedHours: row["Est. Hours"] || row["estimatedHours"] || null,
          startDate: row["Start Date"] || row["startDate"] || null,
          dueDate: row["Due Date"] || row["dueDate"] || null,
          relatedMilestone: row["Milestone"] || row["relatedMilestone"] || "",
          progress: row["Progress %"] || row["progress"] || "0",
          notes: row["Notes"] || row["notes"] || "",
          tags: row["Tags"] || row["tags"] || [],
        }));

      case "clients":
        return data.map((row: any) => ({
          name: row["Client Name"] || row["name"] || row["Name"] || "",
          contactPerson: row["Contact Person"] || row["contactPerson"] || "",
          email: row["Email"] || row["email"] || "",
          phone: row["Phone"] || row["phone"] || "",
          company: row["Company"] || row["company"] || "",
          website: row["Website"] || row["website"] || "",
          country: row["Country"] || row["country"] || "",
        }));

      case "team":
        return data.map((row: any) => ({
          name: row["Name"] || row["name"] || "",
          role: row["Role"] || row["role"] || "",
          email: row["Email"] || row["email"] || "",
          skills: row["Skills"] || row["skills"] || [],
          isAvailable: row["Availability"] || row["isAvailable"] || "available",
        }));

      default:
        return data;
    }
  }

  async function handleImport() {
    if (!file || previewData.length === 0) return;

    setImporting(true);
    setError("");
    setResult(null);

    const data = prepareDataForImport(previewData);

    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: importType, data }),
      });

      const resultData = await res.json();
      setResult(resultData);

      if (!resultData.success) {
        setError(resultData.error || "Import failed");
      }
    } catch (err: any) {
      setError(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    let headers: string[] = [];
    let sampleData: any[] = [];

    switch (importType) {
      case "projects":
        headers = [
          "Project No", "Project Name", "Platforms", "Project Phase",
          "Planned Closure Date", "Completion %", "Last Week Progress",
          "This Week Target", "Project Risks", "Sales Coordinator",
          "Status", "Priority"
        ];
        sampleData = [
          {
            "Project No": "P900",
            "Project Name": "Sample Project",
            "Platforms": "Web, Android",
            "Project Phase": "Coding",
            "Planned Closure Date": "2025-12-31",
            "Completion %": "25",
            "Last Week Progress": "Completed initial setup",
            "This Week Target": "Start development",
            "Project Risks": "None",
            "Sales Coordinator": "Sudha",
            "Status": "active",
            "Priority": "medium"
          }
        ];
        break;

      case "tasks":
        headers = [
          "Project ID", "Task Title", "Description", "Assigned To ID",
          "Status", "Priority", "Est. Hours", "Start Date", "Due Date",
          "Milestone", "Progress %", "Notes", "Tags"
        ];
        sampleData = [
          {
            "Project ID": 1,
            "Task Title": "Setup database",
            "Description": "Create database schema",
            "Assigned To ID": 1,
            "Status": "todo",
            "Priority": "high",
            "Est. Hours": 8,
            "Start Date": "2025-01-01",
            "Due Date": "2025-01-10",
            "Milestone": "Kickstart",
            "Progress %": "0",
            "Notes": "",
            "Tags": "backend,database"
          }
        ];
        break;

      case "clients":
        headers = [
          "Client Name", "Contact Person", "Email", "Phone",
          "Company", "Website", "Country"
        ];
        sampleData = [
          {
            "Client Name": "Sample Client",
            "Contact Person": "John Doe",
            "Email": "john@company.com",
            "Phone": "+1 234 567",
            "Company": "Sample Co",
            "Website": "https://sample.com",
            "Country": "USA"
          }
        ];
        break;

      case "team":
        headers = [
          "Name", "Role", "Email", "Skills", "Availability"
        ];
        sampleData = [
          {
            "Name": "John Doe",
            "Role": "Developer",
            "Email": "john@company.com",
            "Skills": "React, Node.js",
            "Availability": "available"
          }
        ];
        break;
    }

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout]), `${importType}_template.xlsx`);
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
          <p className="text-gray-500 mt-1">Import projects, tasks, clients, or team members from Excel</p>
        </div>
        <button onClick={downloadTemplate} className="btn btn-secondary">
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>

      {/* Import Type Selection */}
      <div className="card mb-6">
        <div className="card-body">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What do you want to import?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: "projects", label: "Projects", icon: FileSpreadsheet },
              { id: "tasks", label: "Tasks", icon: FileSpreadsheet },
              { id: "clients", label: "Clients", icon: FileSpreadsheet },
              { id: "team", label: "Team Members", icon: FileSpreadsheet },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setImportType(item.id); setShowPreview(false); setResult(null); setFile(null); }}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  importType === item.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <item.icon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="font-medium text-gray-900">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="card mb-6">
        <div className="card-body">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Excel File</h2>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {file ? (
              <div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">.xlsx or .xls files</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      {showPreview && previewData.length > 0 && (
        <div className="card mb-6">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Preview ({previewData.length} rows)
            </h2>
            <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="card-body p-0">
            <div className="overflow-x-auto max-h-64">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="text-xs">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="text-xs max-w-[150px] truncate">{String(val || "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 5 && (
              <p className="text-sm text-gray-500 p-3 text-center">
                Showing 5 of {previewData.length} rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Import Button */}
      {file && previewData.length > 0 && (
        <div className="flex items-center justify-end gap-4 mb-6">
          <button
            onClick={handleImport}
            disabled={importing}
            className="btn btn-primary"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Import {previewData.length} {importType}
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`card mb-6 ${result.success ? "border-green-200" : "border-red-200"}`}>
          <div className="card-body">
            <div className="flex items-center gap-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h3 className={`font-semibold ${result.success ? "text-green-900" : "text-red-900"}`}>
                  {result.message}
                </h3>
                <p className="text-sm text-gray-600">
                  {result.inserted} records imported successfully
                </p>
              </div>
            </div>
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-200 mb-6">
          <div className="card-body flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card">
        <div className="card-body">
          <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Download the template first to see the expected column names</li>
            <li>Fill in your data in the template</li>
            <li>Upload the filled Excel file</li>
            <li>Preview the data before importing</li>
            <li>Click Import to save to the database</li>
            <li>Duplicate Project Numbers will be skipped (for projects)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
