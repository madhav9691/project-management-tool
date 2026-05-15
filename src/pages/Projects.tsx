// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PROJECTS PAGE - WITH USER ASSIGNMENT FILTERING
// ==========================================

import React, { useState, useEffect } from 'react';
import { ProjectCard } from '../components/Projects/ProjectCard';
import { ProjectForm } from '../components/Projects/ProjectForm';
import { ProjectDetail } from '../components/Projects/ProjectDetail';
import { mockProjects } from '../data/mockData';
import { getProjectsFromStorage, saveProjectsToStorage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { filterProjectsByUser, canManageProjects } from '../utils/permissions';
import { notifyProjectCreated, notifyProjectUpdated, notifyProjectDeleted } from '../utils/notificationEngine';
import type { ProjectType, ProjectPhase, TaskPriority, Project } from '../types';
import { cn } from '../utils/cn';

import {
  Search,
  Filter,
  Plus,
  Grid3X3,
  List,
  Download,
  FolderKanban,
  Users,
  Shield,
  Eye,
  Edit2,
  Trash2,
  Info
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProjectType>('running');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  
  // Filter states
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');

  // State for projects - Load from localStorage on mount
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  // Filtered projects based on user permissions
  const [visibleProjects, setVisibleProjects] = useState<Project[]>([]);

  // Check if user can edit projects (Project Manager or higher)
  const canEditProjects = canManageProjects(user);

  // Load projects from localStorage on component mount
  useEffect(() => {
    const storedProjects = getProjectsFromStorage();
    if (storedProjects.length > 0) {
      setAllProjects(storedProjects);
    } else {
      // Initialize with mock data if storage is empty
      setAllProjects(mockProjects);
      saveProjectsToStorage(mockProjects);
    }
  }, []);

  // Filter projects based on user assignments whenever projects or user changes
  useEffect(() => {
    const filtered = filterProjectsByUser(user, allProjects);
    setVisibleProjects(filtered);
  }, [user, allProjects]);

  const handleSaveProject = async (projectData: Partial<Project>) => {
    let updatedProjects: Project[];
    
    if (editingProject) {
      updatedProjects = allProjects.map(p => 
        p.id === editingProject.id ? { ...p, ...projectData, updatedAt: new Date() } : p
      );
      notifyProjectUpdated(projectData.projectName || editingProject.projectName, user?.name || 'PM');
    } else {
      const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Project;
      updatedProjects = [...allProjects, newProject];
      notifyProjectCreated(newProject.projectName, newProject.projectNumber, newProject.assignedTeamMembers || []);
    }
    
    // Save to localStorage
    setAllProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
    
    setShowProjectForm(false);
    setEditingProject(null);
  };

  const handleEditProject = (project: Project) => {
    if (!canEditProjects) return;
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (!canEditProjects) return;
    if (window.confirm('Are you sure you want to delete this project?')) {
      const proj = allProjects.find(p => p.id === projectId);
      if (proj) notifyProjectDeleted(proj.projectName, user?.name || 'PM');
      const updatedProjects = allProjects.filter(p => p.id !== projectId);
      setAllProjects(updatedProjects);
      saveProjectsToStorage(updatedProjects);
    }
  };

  const handleViewProject = (project: Project) => {
    setViewingProject(project);
    setShowProjectDetail(true);
  };

  // Apply additional filters (search, phase, priority) to visible projects
  const filteredProjects = visibleProjects.filter(project => {
    const matchesType = project.projectType === activeTab;
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = selectedPhase === 'all' || project.currentPhase === selectedPhase;
    const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
    
    return matchesType && matchesSearch && matchesPhase && matchesPriority;
  });

  const tabs = [
    { id: 'running' as ProjectType, label: 'Running Projects', icon: FolderKanban, count: visibleProjects.filter(p => p.projectType === 'running').length },
    { id: 'dedicated' as ProjectType, label: 'Dedicated', icon: Users, count: visibleProjects.filter(p => p.projectType === 'dedicated').length },
    { id: 'maintenance' as ProjectType, label: 'Maintenance', icon: Shield, count: visibleProjects.filter(p => p.projectType === 'maintenance').length },
  ];

  const phases: ProjectPhase[] = ['UI', 'Development', 'QA', 'UAT', 'Live'];
  const priorities: TaskPriority[] = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">
            {canEditProjects 
              ? 'Manage and track all projects' 
              : 'View your assigned projects'}
          </p>
          {!canEditProjects && (
            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
              <Info className="w-4 h-4" />
              <span>You can only see projects you're assigned to</span>
            </div>
          )}
        </div>
        {canEditProjects && (
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => {
                setEditingProject(null);
                setShowProjectForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        )}
      </div>

      {/* Info Banner for Non-PM Users */}
      {!canEditProjects && visibleProjects.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">No Assigned Projects</p>
              <p className="text-sm text-yellow-700 mt-1">
                You don't have any projects assigned yet. Please contact your Project Manager to be assigned to projects.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full',
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
              showFilters ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
            )}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phase</label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value as ProjectPhase | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Phases</option>
                {phases.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid/List */}
      {filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project}
                onView={handleViewProject}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                canEdit={canEditProjects}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{project.projectName}</p>
                        <p className="text-sm text-gray-500">{project.projectNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.clientCompany}</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getPhaseColor(project.currentPhase))}>
                        {project.currentPhase}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{project.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{project.assignedTeamMembers.length} members</td>
                    <td className="px-6 py-4">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', getPriorityColor(project.priority))}>
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewProject(project)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEditProjects && (
                          <>
                            <button
                              onClick={() => handleEditProject(project)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
          <p className="text-gray-500 mt-1">
            {canEditProjects 
              ? 'Try adjusting your filters or search query'
              : 'You are not assigned to any projects in this category'
            }
          </p>
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        project={editingProject}
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />

      {/* Project Detail Modal */}
      <ProjectDetail
        project={viewingProject!}
        isOpen={showProjectDetail}
        onClose={() => {
          setShowProjectDetail(false);
          setViewingProject(null);
        }}
      />
    </div>
  );
};

function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    'UI': 'bg-pink-100 text-pink-700',
    'Development': 'bg-blue-100 text-blue-700',
    'QA': 'bg-yellow-100 text-yellow-700',
    'UAT': 'bg-purple-100 text-purple-700',
    'Live': 'bg-green-100 text-green-700'
  };
  return colors[phase] || 'bg-gray-100 text-gray-700';
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'Critical': 'bg-red-100 text-red-700',
    'High': 'bg-orange-100 text-orange-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-green-100 text-green-700'
  };
  return colors[priority] || 'bg-gray-100 text-gray-700';
}
