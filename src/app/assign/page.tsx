"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle, User, Building2, Calendar,
  Clock, AlertCircle, Plus, X, Save, Users, ListChecks,
  ChevronRight, FolderKanban, Send,
} from "lucide-react";

interface Project {
  id: number;
  projectNo: string;
  projectName: string;
  platforms: string[];
  projectPhase: string;
  primaryResources: { name: string; role: string }[];
  percentageCompletion: string;
  salesCoordinator: string;
  status: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string | null;
  email: string | null;
  skills: string[] | null;
  isAvailable: string | null;
}

interface ExistingTask {
  id: number;
  title: string;
  assignedTo: number | null;
  status: string;
  priority: string;
  dueDate: string | null;
  progress: string;
}

export default function AssignPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [existingTasks, setExistingTasks] = useState<ExistingTask[]>([]);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    estimatedHours: "",
    startDate: "",
    dueDate: "",
    relatedMilestone: "",
    notes: "",
    tags: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchProjectTasks(selectedProject.id);
    }
  }, [selectedProject]);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  async function fetchMembers() {
    try {
      const res = await fetch("/api/team-members");
      const data = await res.json();
      if (data.success) setMembers(data.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProjectTasks(projectId: number) {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) setExistingTasks(data.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }

  function handleSelectProject(project: Project) {
    setSelectedProject(project);
    setSelectedMember(null);
    setStep(2);
  }

  function handleBackToProjects() {
    setSelectedProject(null);
    setSelectedMember(null);
    setStep(1);
  }

  function handleSelectMember(memberId: number) {
    setSelectedMember(memberId);
    setStep(3);
  }

  function handleBackToMembers() {
    setSelectedMember(null);
    setStep(2);
  }

  function handleBackToTaskForm() {
    setStep(2);
  }

  async function handleSubmitTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject || !selectedMember || !taskForm.title) return;

    setSubmitting(true);

    const payload = {
      projectId: selectedProject.id,
      title: taskForm.title,
      description: taskForm.description,
      assignedTo: selectedMember,
      status: "todo",
      priority: taskForm.priority,
      estimatedHours: taskForm.estimatedHours || null,
      startDate: taskForm.startDate || null,
      dueDate: taskForm.dueDate || null,
      relatedMilestone: taskForm.relatedMilestone || null,
      progress: "0",
      notes: taskForm.notes,
      tags: taskForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTaskForm({
          title: "",
          description: "",
          priority: "medium",
          estimatedHours: "",
          startDate: "",
          dueDate: "",
          relatedMilestone: "",
          notes: "",
          tags: "",
        });
        fetchProjectTasks(selectedProject.id);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setSubmitting(false);
    }
  }

  function getMemberName(memberId: number | null) {
    if (!memberId) return "Unassigned";
    return members.find((m) => m.id === memberId)?.name || "Unknown";
  }

  const selectedMemberData = members.find((m) => m.id === selectedMember);

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
          <h1 className="text-2xl font-bold text-gray-900">Task Assignment</h1>
          <p className="text-gray-500 mt-1">Select a project, then assign tasks to team members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${step >= 1 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
              <FolderKanban className="w-4 h-4" /> Step 1: Project
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${step >= 2 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
              <Users className="w-4 h-4" /> Step 2: Resource
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${step >= 3 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}>
              <ListChecks className="w-4 h-4" /> Step 3: Task
            </span>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Task assigned successfully!</p>
            <p className="text-sm text-green-700">
              "{taskForm.title}" has been assigned to {selectedMemberData?.name}
            </p>
          </div>
        </div>
      )}

      {/* STEP 1: Select Project */}
      {step === 1 && (
        <div>
          <div className="card mb-6">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                Select a Project
              </h2>
              <p className="text-sm text-gray-500 mb-4">Choose the project you want to assign tasks for</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelectProject(project)}
                    className={`text-left p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      selectedProject?.id === project.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-blue-600">{project.projectNo}</span>
                      <span className={`badge ${project.status === "active" ? "badge-success" : "badge-secondary"}`}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{project.projectName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="badge badge-secondary">{project.projectPhase}</span>
                      <span>{project.platforms?.join(", ")}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="progress-bar flex-1">
                        <div className="progress-bar-fill bg-blue-500" style={{ width: `${project.percentageCompletion || 0}%` }}></div>
                      </div>
                      <span className="text-xs font-medium">{project.percentageCompletion || 0}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Select Resource */}
      {step === 2 && selectedProject && (
        <div>
          {/* Project Header */}
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={handleBackToProjects} className="btn btn-secondary">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedProject.projectNo} - {selectedProject.projectName}
                    </h2>
                    <p className="text-sm text-gray-500">Select a team member to assign a task</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Tasks for this Project */}
          {existingTasks.length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ListChecks className="w-4 h-4" /> Existing Tasks ({existingTasks.length})
                </h3>
              </div>
              <div className="card-body p-0">
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Assigned To</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due Date</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {existingTasks.map((task) => (
                        <tr key={task.id}>
                          <td className="font-medium text-gray-900">{task.title}</td>
                          <td>{getMemberName(task.assignedTo)}</td>
                          <td>
                            <span className={`badge ${
                              task.status === "done" ? "badge-success" :
                              task.status === "in_progress" ? "badge-primary" :
                              task.status === "review" ? "badge-secondary" :
                              task.status === "blocked" ? "badge-danger" : "badge-secondary"
                            }`}>
                              {task.status.replace("_", " ")}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              task.priority === "critical" ? "badge-danger" :
                              task.priority === "high" ? "badge-warning" :
                              task.priority === "medium" ? "badge-secondary" : "badge-success"
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="text-sm text-gray-600">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="progress-bar w-16">
                                <div className="progress-bar-fill bg-blue-500" style={{ width: `${task.progress || 0}%` }}></div>
                              </div>
                              <span className="text-xs">{task.progress || 0}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Select Member */}
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Select Team Member
              </h3>
              <p className="text-sm text-gray-500 mb-4">Choose who to assign the task to</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((member) => {
                  const memberTaskCount = existingTasks.filter((t) => t.assignedTo === member.id).length;
                  return (
                    <button
                      key={member.id}
                      onClick={() => handleSelectMember(member.id)}
                      className={`text-left p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                        selectedMember === member.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-500">{member.role || "Team Member"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {memberTaskCount} tasks
                        </span>
                        <span className={`badge ${
                          member.isAvailable === "available" ? "badge-success" : "badge-warning"
                        } text-xs`}>
                          {member.isAvailable}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Create & Assign Task */}
      {step === 3 && selectedProject && selectedMemberData && (
        <div>
          {/* Header */}
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={handleBackToMembers} className="btn btn-secondary">
                    <ArrowRight className="w-4 h-4 rotate-180" /> Back
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">{selectedProject.projectNo.replace("P", "")}</span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedProject.projectName}</h2>
                      <p className="text-sm text-gray-500">Assigning task to...</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                        {selectedMemberData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedMemberData.name}</h3>
                        <p className="text-xs text-gray-500">{selectedMemberData.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" />
                Create New Task
              </h2>
            </div>
            <form onSubmit={handleSubmitTask} className="card-body space-y-6">
              {/* Task Title */}
              <div className="form-group">
                <label className="form-label">Task Title *</label>
                <input
                  type="text"
                  className="form-input text-lg font-medium"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  placeholder="e.g., Implement user authentication module"
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what needs to be done..."
                />
              </div>

              {/* Priority & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskForm.startDate}
                    onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Est. Hours</label>
                  <input
                    type="number"
                    className="form-input"
                    value={taskForm.estimatedHours}
                    onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                    step="0.5"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Milestone & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Related Milestone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={taskForm.relatedMilestone}
                    onChange={(e) => setTaskForm({ ...taskForm, relatedMilestone: e.target.value })}
                    placeholder="e.g., Demo-1, Kickstart"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={taskForm.tags}
                    onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                    placeholder="frontend, api, bug"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea
                  className="form-input form-textarea"
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Any additional context or instructions..."
                />
              </div>

              {/* Assignment Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Assignment Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 text-xs">Project</p>
                    <p className="font-medium text-blue-900">{selectedProject.projectNo} - {selectedProject.projectName}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 text-xs">Assigned To</p>
                    <p className="font-medium text-blue-900">{selectedMemberData.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 text-xs">Priority</p>
                    <p className="font-medium text-blue-900 capitalize">{taskForm.priority}</p>
                  </div>
                  <div>
                    <p className="text-blue-600 text-xs">Due Date</p>
                    <p className="font-medium text-blue-900">{taskForm.dueDate ? new Date(taskForm.dueDate).toLocaleDateString() : "Not set"}</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setTaskForm({
                      title: "",
                      description: "",
                      priority: "medium",
                      estimatedHours: "",
                      startDate: "",
                      dueDate: "",
                      relatedMilestone: "",
                      notes: "",
                      tags: "",
                    });
                  }}
                  className="btn btn-secondary"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !taskForm.title}
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Assigning..." : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
