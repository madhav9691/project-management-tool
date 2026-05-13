"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface Client {
  id: number;
  name: string;
  company: string;
}

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
  clientId: number | null;
  status: string;
  priority: string;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  const [newResource, setNewResource] = useState({ name: "", role: "" });
  const [newMilestone, setNewMilestone] = useState({ name: "", percentage: 0 });
  const [newOpMilestone, setNewOpMilestone] = useState("");
  const [newPlatform, setNewPlatform] = useState("");

  useEffect(() => {
    fetchProject();
    fetchClients();
  }, []);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }

  function handleAddResource() {
    if (newResource.name && newResource.role && project) {
      setProject({
        ...project,
        primaryResources: [...project.primaryResources, { ...newResource }],
      });
      setNewResource({ name: "", role: "" });
    }
  }

  function handleRemoveResource(index: number) {
    if (project) {
      setProject({
        ...project,
        primaryResources: project.primaryResources.filter((_, i) => i !== index),
      });
    }
  }

  function handleAddMilestone() {
    if (newMilestone.name && project) {
      setProject({
        ...project,
        salesMilestones: [
          ...project.salesMilestones,
          { name: newMilestone.name, percentage: newMilestone.percentage },
        ],
      });
      setNewMilestone({ name: "", percentage: 0 });
    }
  }

  function handleRemoveMilestone(index: number) {
    if (project) {
      setProject({
        ...project,
        salesMilestones: project.salesMilestones.filter((_, i) => i !== index),
      });
    }
  }

  function handleAddOpMilestone() {
    if (newOpMilestone && project) {
      setProject({
        ...project,
        operationalMilestones: [...project.operationalMilestones, newOpMilestone],
      });
      setNewOpMilestone("");
    }
  }

  function handleRemoveOpMilestone(index: number) {
    if (project) {
      setProject({
        ...project,
        operationalMilestones: project.operationalMilestones.filter(
          (_, i) => i !== index
        ),
      });
    }
  }

  function handleAddPlatform() {
    if (newPlatform && project && !project.platforms.includes(newPlatform)) {
      setProject({
        ...project,
        platforms: [...project.platforms, newPlatform],
      });
      setNewPlatform("");
    }
  }

  function handleRemovePlatform(platform: string) {
    if (project) {
      setProject({
        ...project,
        platforms: project.platforms.filter((p) => p !== platform),
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;

    setSaving(true);

    try {
      // Only send editable fields, exclude id
      const { id: _id, ...editableProject } = project;

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editableProject,
          clientId: project.clientId || null,
          plannedClosureDate: project.plannedClosureDate || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/projects");
      } else {
        alert("Failed to update project: " + (data.error || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Error updating project:", error);
      alert("Failed to update project: " + (error.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
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

  if (!project) {
    return (
      <div className="p-8">
        <div className="card">
          <div className="card-body text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Project not found
            </h2>
            <Link href="/projects" className="btn btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/projects" className="btn btn-secondary">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.projectNo} - {project.projectName}
            </h1>
            <p className="text-gray-500 mt-1">Edit project details</p>
          </div>
        </div>
        <Link href={`/projects/${projectId}/tasks`} className="btn btn-primary">
          <CheckCircle className="w-5 h-5" />
          View Tasks
        </Link>
        <div className="flex items-center gap-2">
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
          <span
            className={`badge ${
              project.priority === "critical"
                ? "badge-danger"
                : project.priority === "high"
                ? "badge-warning"
                : "badge-secondary"
            }`}
          >
            {project.priority}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Project Number</label>
              <input
                type="text"
                className="form-input"
                value={project.projectNo}
                onChange={(e) =>
                  setProject({ ...project, projectNo: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className="form-input"
                value={project.projectName}
                onChange={(e) =>
                  setProject({ ...project, projectName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client</label>
              <select
                className="form-input"
                value={project.clientId || ""}
                onChange={(e) =>
                  setProject({
                    ...project,
                    clientId: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sales Coordinator</label>
              <input
                type="text"
                className="form-input"
                value={project.salesCoordinator}
                onChange={(e) =>
                  setProject({
                    ...project,
                    salesCoordinator: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={project.status}
                onChange={(e) =>
                  setProject({ ...project, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="onhold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-input"
                value={project.priority}
                onChange={(e) =>
                  setProject({ ...project, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Platforms */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Platforms</h2>
          </div>
          <div className="card-body">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="form-input flex-1"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="Add platform"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPlatform())}
              />
              <button
                type="button"
                onClick={handleAddPlatform}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.platforms.map((platform) => (
                <span
                  key={platform}
                  className="badge badge-primary flex items-center gap-1"
                >
                  {platform}
                  <button
                    type="button"
                    onClick={() => handleRemovePlatform(platform)}
                    className="hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Project Details
            </h2>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Project Phase</label>
              <select
                className="form-input"
                value={project.projectPhase}
                onChange={(e) =>
                  setProject({ ...project, projectPhase: e.target.value })
                }
              >
                <option value="Planning">Planning</option>
                <option value="Designs">Designs</option>
                <option value="Coding">Coding</option>
                <option value="QAQC">QAQC</option>
                <option value="UAT">UAT</option>
                <option value="Live">Live</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Planned Closure Date</label>
              <input
                type="date"
                className="form-input"
                value={project.plannedClosureDate || ""}
                onChange={(e) =>
                  setProject({
                    ...project,
                    plannedClosureDate: e.target.value || null,
                  })
                }
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Project Tracker Link</label>
              <input
                type="url"
                className="form-input"
                value={project.projectTracker}
                onChange={(e) =>
                  setProject({ ...project, projectTracker: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Completion Percentage</label>
              <input
                type="number"
                className="form-input"
                value={project.percentageCompletion}
                onChange={(e) =>
                  setProject({
                    ...project,
                    percentageCompletion: e.target.value,
                  })
                }
                min="0"
                max="100"
              />
            </div>
            {project.plannedClosureDate && (
              <div className="form-group flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Planned: {new Date(project.plannedClosureDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {project.projectTracker && (
              <div className="form-group flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-gray-400" />
                <a
                  href={project.projectTracker}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Open Tracker
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Resources */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Primary Resources
            </h2>
          </div>
          <div className="card-body">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="form-input flex-1"
                value={newResource.name}
                onChange={(e) =>
                  setNewResource({ ...newResource, name: e.target.value })
                }
                placeholder="Team member name"
              />
              <input
                type="text"
                className="form-input flex-1"
                value={newResource.role}
                onChange={(e) =>
                  setNewResource({ ...newResource, role: e.target.value })
                }
                placeholder="Role"
              />
              <button
                type="button"
                onClick={handleAddResource}
                className="btn btn-secondary"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {project.primaryResources.map((resource, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span>
                    <strong>{resource.name}</strong> - {resource.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Sales Milestones
              </h2>
            </div>
            <div className="card-body">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="form-input flex-1"
                  value={newMilestone.name}
                  onChange={(e) =>
                    setNewMilestone({ ...newMilestone, name: e.target.value })
                  }
                  placeholder="Milestone name"
                />
                <input
                  type="number"
                  className="form-input w-20"
                  value={newMilestone.percentage}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      percentage: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="%"
                  min="0"
                  max="100"
                />
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.salesMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span>
                      {milestone.name} - <strong>{milestone.percentage}%</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">
                Operational Milestones
              </h2>
            </div>
            <div className="card-body">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  className="form-input flex-1"
                  value={newOpMilestone}
                  onChange={(e) => setNewOpMilestone(e.target.value)}
                  placeholder="Add milestone"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOpMilestone())}
                />
                <button
                  type="button"
                  onClick={handleAddOpMilestone}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {project.operationalMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span>{milestone}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOpMilestone(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Quick View */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Tasks Overview</h2>
            <Link href={`/projects/${projectId}/tasks`} className="btn btn-primary btn-sm">
              <CheckCircle className="w-4 h-4" /> Manage Tasks
            </Link>
          </div>
          <div className="card-body">
            <p className="text-sm text-gray-600">
              Manage all tasks assigned to this project. Assign tasks to team members, set deadlines, and track progress from To Do → In Progress → In Review → Completed.
            </p>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">
              Progress Tracking
            </h2>
          </div>
          <div className="card-body grid grid-cols-1 gap-4">
            <div className="form-group">
              <label className="form-label">Last Week Progress</label>
              <textarea
                className="form-input form-textarea"
                value={project.lastWeekProgress}
                onChange={(e) =>
                  setProject({ ...project, lastWeekProgress: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">This Week Target</label>
              <textarea
                className="form-input form-textarea"
                value={project.thisWeekTarget}
                onChange={(e) =>
                  setProject({ ...project, thisWeekTarget: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Project Risks</label>
              <textarea
                className="form-input form-textarea"
                value={project.projectRisks}
                onChange={(e) =>
                  setProject({ ...project, projectRisks: e.target.value })
                }
                rows={2}
              />
              {project.projectRisks && (
                <div className="flex items-center gap-2 mt-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Risks identified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/projects" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save className="w-5 h-5" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
