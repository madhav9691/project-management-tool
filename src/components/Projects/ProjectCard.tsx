// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PROJECT CARD COMPONENT
// ==========================================

import React from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate, getStatusColor, formatPercentage } from '../../utils/formatters';

import {
  Calendar,
  Users,
  AlertCircle,
  ArrowUpRight,
  Smartphone,
  Globe
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getPlatformIcons = () => {
    const icons = [];
    if (project.platforms.android) icons.push(<Smartphone key="android" className="w-4 h-4" />);
    if (project.platforms.ios) icons.push(<Smartphone key="ios" className="w-4 h-4" />);
    if (project.platforms.webFrontend || project.platforms.webBackend) {
      icons.push(<Globe key="web" className="w-4 h-4" />);
    }
    return icons;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500">{project.projectNumber}</span>
            <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(project.currentPhase))}>
              {project.currentPhase}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {project.projectName}
          </h3>
          <p className="text-sm text-gray-500 truncate">{project.clientCompany}</p>
        </div>
        <Link 
          to={`/projects/${project.id}`}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowUpRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{formatPercentage(project.completionPercentage)}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{formatDate(project.plannedClosureDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{project.assignedTeamMembers.length} members</span>
        </div>
      </div>

      {/* Platforms & Priority */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {getPlatformIcons()}
        </div>
        <div className="flex items-center gap-3">
          {project.risks.length > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-medium">{project.risks.length} risks</span>
            </div>
          )}
          <span className={cn(
            'px-2 py-1 text-xs font-medium rounded-full',
            project.priority === 'Critical' ? 'bg-red-100 text-red-700' :
            project.priority === 'High' ? 'bg-orange-100 text-orange-700' :
            project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          )}>
            {project.priority}
          </span>
        </div>
      </div>
    </div>
  );
};
