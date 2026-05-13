"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, X } from "lucide-react";
import Link from "next/link";

interface Client {
  id: number;
  name: string;
  company: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    projectNo: "",
    projectName: "",
    platforms: [] as string[],
    primaryResources: [] as { name: string; role: string }[],
    projectPhase: "Planning",
    projectTracker: "",
    plannedClosureDate: "",
    salesMilestones: [] as { name: string; percentage: number }[],
    operationalMilestones: [] as string[],
    percentageCompletion: "0",
    lastWeekProgress: "",
    thisWeekTarget: "",
    projectRisks: "",
    salesCoordinator: "",
    clientId: "",
    status: "active",
    priority: "medium",
  });

  const [newResource, setNewResource] = useState({ name: "", role: "" });
  const [newMilestone, setNewMilestone] = useState({ name: "", percentage: 0 });
  const [newOpMilestone, setNewOpMilestone] = useState("");
  const [newPlatform, setNewPlatform] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

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
    if (newResource.name && newResource.role) {
      setFormData({
        ...formData,
        primaryResources: [...formData.primaryResources, { ...newResource }],
      });
      setNewResource({ name: "", role: "" });
    }
  }

  function handleRemoveResource(index: number) {
    setFormData({
      ...formData,
      primaryResources: formData.primaryResources.filter((_, i) => i !== index),
    });
  }

  function handleAddMilestone() {
    if (newMilestone.name) {
      setFormData({
        ...formData,
        salesMilestones: [
          ...formData.salesMilestones,
          { name: newMilestone.name, percentage: newMilestone.percentage },
        ],
      });
      setNewMilestone({ name: "", percentage: 0 });
    }
  }

  function handleRemoveMilestone(index: number) {
    setFormData({
      ...formData,
      salesMilestones: formData.salesMilestones.filter((_, i) => i !== index),
    });
  }

  function handleAddOpMilestone() {
    if (newOpMilestone) {
      setFormData({
        ...formData,
        operationalMilestones: [...formData.operationalMilestones, newOpMilestone],
      });
      setNewOpMilestone("");
    }
  }

  function handleRemoveOpMilestone(index: number) {
    setFormData({
      ...formData,
      operationalMilestones: formData.operationalMilestones.filter(
        (_, i) => i !== index
      ),
    });
  }

  function handleAddPlatform() {
    if (newPlatform && !formData.platforms.includes(newPlatform)) {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, newPlatform],
      });
      setNewPlatform("");
    }
  }

  function handleRemovePlatform(platform: string) {
    setFormData({
      ...formData,
      platforms: formData.platforms.filter((p) => p !== platform),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          clientId: formData.clientId ? parseInt(formData.clientId) : null,
          plannedClosureDate: formData.plannedClosureDate || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/projects");
      } else {
        alert("Failed to create project: " + data.error);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/projects" className="btn btn-secondary">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
          <p className="text-gray-500 mt-1">
            Create a new project to track
          </p>
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
              <label className="form-label">Project Number *</label>
              <input
                type="text"
                className="form-input"
                value={formData.projectNo}
                onChange={(e) =>
                  setFormData({ ...formData, projectNo: e.target.value })
                }
                required
                placeholder="e.g., P879"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
                placeholder="e.g., Infinity - Customer Portal"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Client</label>
              <select
                className="form-input"
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
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
                value={formData.salesCoordinator}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salesCoordinator: e.target.value,
                  })
                }
                placeholder="e.g., Sudha"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
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
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
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
                placeholder="Add platform (e.g., Web, Android, iOS)"
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
              {formData.platforms.map((platform) => (
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

        {/* Project Phase */}
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
                value={formData.projectPhase}
                onChange={(e) =>
                  setFormData({ ...formData, projectPhase: e.target.value })
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
                value={formData.plannedClosureDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    plannedClosureDate: e.target.value,
                  })
                }
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">Project Tracker Link</label>
              <input
                type="url"
                className="form-input"
                value={formData.projectTracker}
                onChange={(e) =>
                  setFormData({ ...formData, projectTracker: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Completion Percentage</label>
              <input
                type="number"
                className="form-input"
                value={formData.percentageCompletion}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentageCompletion: e.target.value,
                  })
                }
                min="0"
                max="100"
              />
            </div>
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
                placeholder="Role (e.g., Developer, QA)"
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
              {formData.primaryResources.map((resource, index) => (
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

        {/* Sales Milestones */}
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
                className="form-input w-24"
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
              {formData.salesMilestones.map((milestone, index) => (
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

        {/* Operational Milestones */}
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
                placeholder="Add operational milestone"
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
              {formData.operationalMilestones.map((milestone, index) => (
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
                value={formData.lastWeekProgress}
                onChange={(e) =>
                  setFormData({ ...formData, lastWeekProgress: e.target.value })
                }
                placeholder="What was accomplished last week?"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">This Week Target</label>
              <textarea
                className="form-input form-textarea"
                value={formData.thisWeekTarget}
                onChange={(e) =>
                  setFormData({ ...formData, thisWeekTarget: e.target.value })
                }
                placeholder="What are the targets for this week?"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Project Risks</label>
              <textarea
                className="form-input form-textarea"
                value={formData.projectRisks}
                onChange={(e) =>
                  setFormData({ ...formData, projectRisks: e.target.value })
                }
                placeholder="Any risks or blockers?"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/projects" className="btn btn-secondary">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save className="w-5 h-5" />
            {loading ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
