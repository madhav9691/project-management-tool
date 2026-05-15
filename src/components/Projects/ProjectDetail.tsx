// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PROJECT DETAIL VIEW COMPONENT
// ==========================================

import React from 'react';
import type { Project } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate, formatPercentage, getStatusColor } from '../../utils/formatters';

import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  Users,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{project.projectName}</h3>
                <p className="text-sm text-gray-500">{project.projectNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-3">
              <span className={cn('px-3 py-1 text-sm font-medium rounded-full', getStatusColor(project.currentPhase))}>
                {project.currentPhase}
              </span>
              <span className={cn(
                'px-3 py-1 text-sm font-medium rounded-full',
                project.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                project.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              )}>
                {project.priority} Priority
              </span>
              <span className={cn(
                'px-3 py-1 text-sm font-medium rounded-full',
                project.status === 'Active' ? 'bg-green-100 text-green-700' :
                project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                project.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              )}>
                {project.status}
              </span>
              <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                {project.projectType === 'running' ? 'Running' : 
                 project.projectType === 'dedicated' ? 'Dedicated' : 'Maintenance'}
              </span>
            </div>

            {/* Progress Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Project Progress</h4>
                <span className="text-2xl font-bold text-blue-600">{formatPercentage(project.completionPercentage)}</span>
              </div>
              <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-200">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    project.completionPercentage >= 90 ? 'bg-green-500' :
                    project.completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                  )}
                  style={{ width: `${project.completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Client Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Client Name</p>
                    <p className="font-medium text-gray-900">{project.clientName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${project.clientEmail}`} className="font-medium text-blue-600 hover:underline">
                      {project.clientEmail}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{project.clientPhone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{project.clientCompany}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium text-gray-900">{project.country}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Sales Coordinator</p>
                    <p className="font-medium text-gray-900">{project.salesCoordinator || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team & Management */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team & Management
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Project Manager</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {project.projectManager.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="font-medium text-gray-900">{project.projectManager}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Assigned Team ({project.assignedTeamMembers.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {project.assignedTeamMembers.map((member, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                        {member}
                      </span>
                    ))}
                  </div>
                </div>
                {project.primaryResources.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Primary Resources</p>
                    <div className="flex flex-wrap gap-1">
                      {project.primaryResources.map((resource, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-700">
                          {resource}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Platforms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Platforms
              </h4>
              <div className="flex flex-wrap gap-3">
                {project.platforms.android && (
                  <span className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-700">Android</span>
                  </span>
                )}
                {project.platforms.ios && (
                  <span className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-700">iOS</span>
                  </span>
                )}
                {project.platforms.webFrontend && (
                  <span className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <Monitor className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-purple-700">Web Frontend</span>
                  </span>
                )}
                {project.platforms.webBackend && (
                  <span className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <span className="font-medium text-indigo-700">Web Backend</span>
                  </span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Project Timeline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="font-medium text-gray-900">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Planned Closure</p>
                  <p className="font-medium text-gray-900">{formatDate(project.plannedClosureDate)}</p>
                </div>
                {project.actualClosureDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Actual Closure</p>
                    <p className="font-medium text-green-600">{formatDate(project.actualClosureDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Updates */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Progress
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Current Week Updates</p>
                  <p className="text-gray-900 bg-white p-3 rounded border border-gray-200">
                    {project.currentWeekUpdates || 'No updates'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Next Week Target</p>
                  <p className="text-gray-900 bg-white p-3 rounded border border-gray-200">
                    {project.nextWeekTarget || 'No targets set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Risks & Escalations */}
            {(project.risks.length > 0 || project.escalations.length > 0) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Risks & Escalations
                </h4>
                <div className="space-y-3">
                  {project.risks.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Risks / Issues ({project.risks.length})</p>
                      <ul className="space-y-1">
                        {project.risks.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-orange-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.escalations.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Escalations ({project.escalations.length})</p>
                      <ul className="space-y-1">
                        {project.escalations.map((escalation, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-red-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{escalation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Project Links
              </h4>
              <div className="space-y-2">
                {project.projectTrackerLink && (
                  <a href={project.projectTrackerLink} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-600 hover:underline p-2 bg-white rounded border border-gray-200">
                    <LinkIcon className="w-4 h-4" />
                    <span>Project Tracker</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {project.figmaLink && (
                  <a href={project.figmaLink} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-pink-600 hover:underline p-2 bg-white rounded border border-gray-200">
                    <LinkIcon className="w-4 h-4" />
                    <span>Figma Design</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
                {project.gitRepository && (
                  <a href={project.gitRepository} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-gray-700 hover:underline p-2 bg-white rounded border border-gray-200">
                    <LinkIcon className="w-4 h-4" />
                    <span>Git Repository</span>
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                )}
              </div>
            </div>

            {/* Server & Hosting */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ServerIcon className="w-5 h-5" />
                Infrastructure
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.serverDetails && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Server Details</p>
                    <p className="font-medium text-gray-900">{project.serverDetails}</p>
                  </div>
                )}
                {project.hostingDetails && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Hosting Details</p>
                    <p className="font-medium text-gray-900">{project.hostingDetails}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks */}
            {project.remarks && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Remarks
                </h4>
                <p className="text-yellow-800">{project.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple server icon component
const ServerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
  </svg>
);
