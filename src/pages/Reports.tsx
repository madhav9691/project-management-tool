// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// REPORTS & ANALYTICS PAGE
// ==========================================

import React, { useState } from 'react';
import { mockProjects, mockTasks, mockResources } from '../data/mockData';
import { cn } from '../utils/cn';

import {
  BarChart3,
  Download,
  Calendar,
  FileText,
  PieChart,
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  Filter
} from 'lucide-react';

const reportTypes = [
  { id: 'weekly', name: 'Weekly Project Report', icon: Calendar },
  { id: 'monthly', name: 'Monthly Project Report', icon: Calendar },
  { id: 'utilization', name: 'Resource Utilization', icon: Users },
  { id: 'tasks', name: 'Task Performance', icon: Briefcase },
  { id: 'maintenance', name: 'Maintenance Hours', icon: Clock },
  { id: 'collections', name: 'Collections Report', icon: TrendingUp },
  { id: 'delayed', name: 'Delayed Projects', icon: Clock },
  { id: 'risks', name: 'Risk Analysis', icon: PieChart },
];

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('weekly');
  const [dateRange, setDateRange] = useState('last-30-days');

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Generate and download comprehensive reports</p>
        </div>
      </div>

      {/* Report Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left',
                  selectedReport === report.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                <div className={cn(
                  'p-2 rounded-lg',
                  selectedReport === report.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  'font-medium',
                  selectedReport === report.id ? 'text-blue-900' : 'text-gray-700'
                )}>
                  {report.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Report Filters</span>
          </div>
          <div className="flex-1" />
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="last-7-days">Last 7 Days</option>
              <option value="last-30-days">Last 30 Days</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <BarChart3 className="w-4 h-4" />
              Generate
            </button>
          </div>
        </div>

        {/* Report Preview */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {reportTypes.find(r => r.id === selectedReport)?.name} Preview
            </h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>

          {/* Sample Report Data */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{mockProjects.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{mockTasks.filter(t => t.status !== 'Completed').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{mockResources.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {mockProjects.slice(0, 5).map((project) => {
                    const projectTasks = mockTasks.filter(t => t.projectId === project.id);
                    return (
                      <tr key={project.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{project.projectName}</p>
                          <p className="text-xs text-gray-500">{project.projectNumber}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${project.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{project.completionPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{projectTasks.length}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{project.assignedTeamMembers.length}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
