// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// RISKS & ESCALATIONS PAGE
// ==========================================

import React, { useState } from 'react';
import { mockRisks } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { cn } from '../utils/cn';

import {
  AlertTriangle,
  Shield,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  User,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

export const Risks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Low' | 'Medium' | 'High' | 'Critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'In Progress' | 'Mitigated' | 'Closed'>('all');

  const filteredRisks = mockRisks.filter(risk => {
    const matchesSearch = 
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || risk.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const stats = [
    { label: 'Total Risks', value: mockRisks.length, color: 'bg-blue-500', icon: AlertTriangle },
    { label: 'High/Critical', value: mockRisks.filter(r => r.severity === 'High' || r.severity === 'Critical').length, color: 'bg-red-500', icon: AlertCircle },
    { label: 'Open', value: mockRisks.filter(r => r.status === 'Open').length, color: 'bg-yellow-500', icon: Clock },
    { label: 'Mitigated', value: mockRisks.filter(r => r.status === 'Mitigated').length, color: 'bg-green-500', icon: CheckCircle2 },
  ];

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'Critical': 'bg-red-100 text-red-700 border-red-200',
      'High': 'bg-orange-100 text-orange-700 border-orange-200',
      'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Low': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[severity] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-red-100 text-red-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Mitigated': 'bg-blue-100 text-blue-700',
      'Closed': 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risks & Escalations</h1>
          <p className="text-gray-500 mt-1">Track and manage project risks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
          <Plus className="w-4 h-4" />
          Report Risk
        </button>
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

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Mitigated">Mitigated</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => (
          <div key={risk.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{risk.title}</h3>
                  <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full border', getSeverityColor(risk.severity))}>
                    {risk.severity}
                  </span>
                  <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getStatusColor(risk.status))}>
                    {risk.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>{risk.projectName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>Owner: {risk.assignedOwner}</span>
                  </div>
                  {risk.expectedClosureDate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Expected: {formatDate(risk.expectedClosureDate)}</span>
                    </div>
                  )}
                </div>

                {risk.resolutionPlan && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Resolution Plan</p>
                    <p className="text-sm text-blue-700 mt-1">{risk.resolutionPlan}</p>
                  </div>
                )}
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
