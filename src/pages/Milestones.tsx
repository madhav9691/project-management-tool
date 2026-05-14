// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// MILESTONES & PAYMENTS PAGE
// ==========================================

import React, { useState } from 'react';
import { mockMilestones } from '../data/mockData';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/formatters';

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Search,
  DollarSign
} from 'lucide-react';

export const Milestones: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Partial' | 'Received'>('all');

  const filteredMilestones = mockMilestones.filter(milestone => {
    const matchesSearch = 
      milestone.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      milestone.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || milestone.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalAmount = mockMilestones.reduce((acc, m) => acc + m.amount, 0);
  const receivedAmount = mockMilestones
    .filter(m => m.paymentStatus === 'Received')
    .reduce((acc, m) => acc + m.amount, 0);
  const pendingAmount = mockMilestones
    .filter(m => m.paymentStatus === 'Pending')
    .reduce((acc, m) => acc + m.amount, 0);
  const overdueCount = mockMilestones.filter(m => 
    m.paymentStatus === 'Pending' && new Date(m.dueDate) < new Date()
  ).length;

  const stats = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(totalAmount), 
      icon: DollarSign, 
      color: 'bg-blue-500',
      trend: '+12%'
    },
    { 
      label: 'Received', 
      value: formatCurrency(receivedAmount), 
      icon: CheckCircle2, 
      color: 'bg-green-500',
      trend: '+8%'
    },
    { 
      label: 'Pending', 
      value: formatCurrency(pendingAmount), 
      icon: Clock, 
      color: 'bg-yellow-500',
      trend: '-3%'
    },
    { 
      label: 'Overdue', 
      value: overdueCount.toString(), 
      icon: AlertCircle, 
      color: 'bg-red-500',
      trend: 'Attention needed'
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestones & Payments</h1>
          <p className="text-gray-500 mt-1">Track project milestones and payment collections</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            <Plus className="w-4 h-4" />
            Add Milestone
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 ${stat.color.replace('bg-', 'bg-').replace('500', '100')} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-xs text-gray-500">{stat.trend}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
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
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'Pending', 'Partial', 'Received'] as const).map((status) => (
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

      {/* Milestones Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMilestones.map((milestone) => (
              <tr key={milestone.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{milestone.name}</p>
                  {milestone.notes && (
                    <p className="text-sm text-gray-500 mt-1">{milestone.notes}</p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{milestone.projectName}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                    {milestone.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {formatCurrency(milestone.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(milestone.dueDate)}
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    milestone.paymentStatus === 'Received' && 'bg-green-100 text-green-700',
                    milestone.paymentStatus === 'Pending' && 'bg-yellow-100 text-yellow-700',
                    milestone.paymentStatus === 'Partial' && 'bg-orange-100 text-orange-700'
                  )}>
                    {milestone.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {milestone.invoiceNumber || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
