// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// MAINTENANCE PROJECTS PAGE
// ==========================================

import React, { useState } from 'react';
import { mockMaintenanceProjects } from '../data/mockData';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';

import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Server,
  Globe,
  HardDrive,
  Download,
  Plus,
  Search
} from 'lucide-react';

export const Maintenance: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Expired' | 'Pending Renewal'>('all');

  const filteredProjects = mockMaintenanceProjects.filter(project => {
    const matchesSearch = 
      project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const activeCount = mockMaintenanceProjects.filter(p => p.status === 'Active').length;
  const pendingRenewal = mockMaintenanceProjects.filter(p => p.status === 'Pending Renewal').length;
  const expiringSSL = mockMaintenanceProjects.filter(p => {
    if (!p.sslExpiryDate) return false;
    const daysLeft = Math.ceil((p.sslExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30;
  }).length;

  const stats = [
    { label: 'Active Projects', value: activeCount, icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'Pending Renewal', value: pendingRenewal, icon: Clock, color: 'bg-yellow-500' },
    { label: 'SSL Expiring Soon', value: expiringSSL, icon: AlertTriangle, color: 'bg-red-500' },
    { label: 'Total Hours (Month)', value: '156h', icon: Clock, color: 'bg-blue-500' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Projects</h1>
          <p className="text-gray-500 mt-1">Track maintenance contracts and renewals</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            Add Project
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
      {expiringSSL > 0 && (
        <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-900">SSL Certificates Expiring Soon</p>
            <p className="text-sm text-orange-700 mt-1">
              {expiringSSL} projects have SSL certificates expiring within 30 days. Please schedule renewals.
            </p>
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
        <div className="flex gap-2">
          {(['all', 'Active', 'Pending Renewal', 'Expired'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                statusFilter === status 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{project.projectNumber}</span>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    project.status === 'Active' ? 'bg-green-100 text-green-700' :
                    project.status === 'Pending Renewal' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  )}>
                    {project.status}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{project.projectName}</h3>
                <p className="text-sm text-gray-500">{project.clientName}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Billing Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Billing Cycle</p>
                <p className="font-medium text-gray-900">{project.billingCycle}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Renewal Date</p>
                <p className="font-medium text-gray-900">{formatDate(project.renewalDate)}</p>
              </div>
            </div>

            {/* Expiry Dates */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {project.sslExpiryDate && (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">SSL</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(project.sslExpiryDate)}</p>
                </div>
              )}
              {project.hostingExpiryDate && (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Server className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Hosting</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(project.hostingExpiryDate)}</p>
                </div>
              )}
              {project.domainExpiryDate && (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Domain</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(project.domainExpiryDate)}</p>
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
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
          </div>
        ))}
      </div>
    </div>
  );
};
