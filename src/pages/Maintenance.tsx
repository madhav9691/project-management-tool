// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// MAINTENANCE PROJECTS PAGE - FULLY IMPLEMENTED
// ==========================================

import React, { useState, useEffect } from 'react';
import { mockMaintenanceProjects } from '../data/mockData';
import { MaintenanceForm } from '../components/Maintenance/MaintenanceForm';
// storage import reserved for future backend
import { cn } from '../utils/cn';
import { formatDate, getDaysLeft } from '../utils/formatters';

import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Server,
  HardDrive,
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  X
} from 'lucide-react';

import type { MaintenanceProject, BillingCycle } from '../types';

export const Maintenance: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Expired' | 'Pending Renewal'>('all');
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [editingProject, setEditingProject] = useState<MaintenanceProject | null>(null);
  const [viewingProject, setViewingProject] = useState<MaintenanceProject | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // State for maintenance projects
  const [projects, setProjects] = useState<MaintenanceProject[]>([]);

  // Load projects from localStorage on mount
  useEffect(() => {
    // For now, use mock data - in production, load from storage
    setProjects(mockMaintenanceProjects);
  }, []);

  const handleSaveProject = async (projectData: Partial<MaintenanceProject>) => {
    let updatedProjects: MaintenanceProject[];
    
    if (editingProject) {
      updatedProjects = projects.map(p => 
        p.id === editingProject.id ? { ...p, ...projectData } as MaintenanceProject : p
      );
    } else {
      const newProject: MaintenanceProject = {
        id: `maint-${Date.now()}`,
        projectNumber: projectData.projectNumber || '',
        projectName: projectData.projectName || '',
        clientName: projectData.clientName || '',
        clientEmail: projectData.clientEmail || '',
        clientPhone: projectData.clientPhone || '',
        billingCycle: (projectData.billingCycle || '12 Months') as BillingCycle,
        maintenanceStartDate: projectData.maintenanceStartDate || new Date(),
        renewalDate: projectData.renewalDate || new Date(),
        sslExpiryDate: projectData.sslExpiryDate,
        hostingExpiryDate: projectData.hostingExpiryDate,
        domainExpiryDate: projectData.domainExpiryDate,
        lastBackupDate: projectData.lastBackupDate,
        assignedResources: projectData.assignedResources || [],
        weeklyHours: projectData.weeklyHours || {},
        monthlyHours: projectData.monthlyHours || {},
        issuesWorked: projectData.issuesWorked || 0,
        updatesDone: projectData.updatesDone || 0,
        changeRequests: projectData.changeRequests || 0,
        ticketReferences: projectData.ticketReferences || [],
        status: (projectData.status || 'Active') as MaintenanceProject['status']
      };
      updatedProjects = [...projects, newProject];
    }
    
    setProjects(updatedProjects);
    setShowMaintenanceForm(false);
    setEditingProject(null);
  };

  const handleEditProject = (project: MaintenanceProject) => {
    setEditingProject(project);
    setShowMaintenanceForm(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this maintenance project?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
    }
  };

  const handleViewProject = (project: MaintenanceProject) => {
    setViewingProject(project);
    setShowViewModal(true);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeCount = projects.filter(p => p.status === 'Active').length;
  const pendingRenewal = projects.filter(p => p.status === 'Pending Renewal').length;
  const expiringSSL = projects.filter(p => {
    if (!p.sslExpiryDate) return false;
    const daysLeft = getDaysLeft(p.sslExpiryDate);
    return daysLeft <= 30 && daysLeft > 0;
  }).length;
  const expiringHosting = projects.filter(p => {
    if (!p.hostingExpiryDate) return false;
    const daysLeft = getDaysLeft(p.hostingExpiryDate);
    return daysLeft <= 30 && daysLeft > 0;
  }).length;

  const stats = [
    { label: 'Active Projects', value: activeCount, icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Pending Renewal', value: pendingRenewal, icon: Clock, color: 'bg-yellow-500' },
    { label: 'SSL Expiring Soon', value: expiringSSL, icon: Shield, color: 'bg-red-500' },
    { label: 'Hosting Expiring', value: expiringHosting, icon: Server, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Projects</h1>
          <p className="text-gray-500 mt-1">Track maintenance contracts, renewals, and support</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={() => {
              setEditingProject(null);
              setShowMaintenanceForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Maintenance Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${stat.color.replace('bg-', 'bg-').replace('500', '100')} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-sm text-gray-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(expiringSSL > 0 || expiringHosting > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Expiring Services Alert</p>
              <p className="text-sm text-red-700 mt-1">
                {expiringSSL > 0 && `${expiringSSL} SSL certificate${expiringSSL > 1 ? 's are' : ' is'} expiring within 30 days. `}
                {expiringHosting > 0 && `${expiringHosting} hosting service${expiringHosting > 1 ? 's are' : ' is'} expiring within 30 days.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search maintenance projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'Active', 'Pending Renewal', 'Expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === status 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const sslDaysLeft = project.sslExpiryDate ? getDaysLeft(project.sslExpiryDate) : null;
            const hostingDaysLeft = project.hostingExpiryDate ? getDaysLeft(project.hostingExpiryDate) : null;
            
            return (
              <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-500">{project.projectNumber}</span>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        project.status === 'Active' ? 'bg-green-100 text-green-700' :
                        project.status === 'Pending Renewal' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {project.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{project.projectName}</h3>
                    <p className="text-sm text-gray-500">{project.clientName}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewProject(project)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
                  </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Billing Cycle</p>
                    <p className="font-medium text-gray-900">{project.billingCycle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Renewal Date</p>
                    <p className="font-medium text-gray-900">{formatDate(project.renewalDate)}</p>
                  </div>
                </div>

                {/* Expiry Dates with Alerts */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {project.sslExpiryDate && (
                    <div className={cn(
                      'p-3 rounded-lg border',
                      sslDaysLeft && sslDaysLeft <= 30 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className={cn('w-4 h-4', sslDaysLeft && sslDaysLeft <= 30 ? 'text-red-500' : 'text-gray-400')} />
                        <span className="text-xs text-gray-500">SSL</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(project.sslExpiryDate)}</p>
                      {sslDaysLeft && sslDaysLeft <= 30 && (
                        <p className="text-xs text-red-600 font-medium">{sslDaysLeft} days left</p>
                      )}
                    </div>
                  )}
                  {project.hostingExpiryDate && (
                    <div className={cn(
                      'p-3 rounded-lg border',
                      hostingDaysLeft && hostingDaysLeft <= 30 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <Server className={cn('w-4 h-4', hostingDaysLeft && hostingDaysLeft <= 30 ? 'text-orange-500' : 'text-gray-400')} />
                        <span className="text-xs text-gray-500">Hosting</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(project.hostingExpiryDate)}</p>
                      {hostingDaysLeft && hostingDaysLeft <= 30 && (
                        <p className="text-xs text-orange-600 font-medium">{hostingDaysLeft} days left</p>
                      )}
                    </div>
                  )}
                  {project.domainExpiryDate && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-500">Domain</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(project.domainExpiryDate)}</p>
                    </div>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{project.issuesWorked}</p>
                    <p className="text-xs text-gray-500">Issues Fixed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{project.updatesDone}</p>
                    <p className="text-xs text-gray-500">Updates</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{project.changeRequests}</p>
                    <p className="text-xs text-gray-500">Change Req</p>
                  </div>
                </div>

                {/* Assigned Resources */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Assigned Resources</p>
                  <div className="flex flex-wrap gap-1">
                    {project.assignedResources.map((resource, idx) => (
                      <span key={idx} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No maintenance projects found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters or add a new project</p>
        </div>
      )}

      {/* Maintenance Form Modal */}
      <MaintenanceForm
        project={editingProject}
        isOpen={showMaintenanceForm}
        onClose={() => {
          setShowMaintenanceForm(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />

      {/* View Project Modal */}
      {showViewModal && viewingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="min-h-screen px-4 py-8 flex items-start justify-center">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-xl font-bold text-gray-900">Maintenance Project Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                {/* Project Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Project Number</p>
                    <p className="font-medium text-gray-900">{viewingProject.projectNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={cn(
                      'px-3 py-1 text-sm font-medium rounded-full',
                      viewingProject.status === 'Active' ? 'bg-green-100 text-green-700' :
                      viewingProject.status === 'Pending Renewal' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {viewingProject.status}
                    </span>
                  </div>
                </div>

                {/* Client Info */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Client Name</p>
                      <p className="font-medium text-gray-900">{viewingProject.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{viewingProject.clientEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{viewingProject.clientPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Important Dates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">{formatDate(viewingProject.maintenanceStartDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Renewal Date</p>
                      <p className="font-medium text-gray-900">{formatDate(viewingProject.renewalDate)}</p>
                    </div>
                    {viewingProject.sslExpiryDate && (
                      <div>
                        <p className="text-sm text-gray-500">SSL Expiry</p>
                        <p className="font-medium text-gray-900">{formatDate(viewingProject.sslExpiryDate)}</p>
                      </div>
                    )}
                    {viewingProject.hostingExpiryDate && (
                      <div>
                        <p className="text-sm text-gray-500">Hosting Expiry</p>
                        <p className="font-medium text-gray-900">{formatDate(viewingProject.hostingExpiryDate)}</p>
                      </div>
                    )}
                    {viewingProject.domainExpiryDate && (
                      <div>
                        <p className="text-sm text-gray-500">Domain Expiry</p>
                        <p className="font-medium text-gray-900">{formatDate(viewingProject.domainExpiryDate)}</p>
                      </div>
                    )}
                    {viewingProject.lastBackupDate && (
                      <div>
                        <p className="text-sm text-gray-500">Last Backup</p>
                        <p className="font-medium text-gray-900">{formatDate(viewingProject.lastBackupDate)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{viewingProject.issuesWorked}</p>
                    <p className="text-sm text-gray-600">Issues Worked</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{viewingProject.updatesDone}</p>
                    <p className="text-sm text-gray-600">Updates Done</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-600">{viewingProject.changeRequests}</p>
                    <p className="text-sm text-gray-600">Change Requests</p>
                  </div>
                </div>

                {/* Assigned Resources */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Assigned Resources</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingProject.assignedResources.map((resource, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ticket References */}
                {viewingProject.ticketReferences && viewingProject.ticketReferences.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Ticket References</h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingProject.ticketReferences.map((ticket, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm">
                          {ticket}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
