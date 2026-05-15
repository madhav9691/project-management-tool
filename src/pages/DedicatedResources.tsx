// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// DEDICATED RESOURCES PAGE - FULLY IMPLEMENTED
// ==========================================

import React, { useState } from 'react';
import { mockResources } from '../data/mockData';
import { DedicatedResourceForm } from '../components/Dedicated/DedicatedResourceForm';
import { cn } from '../utils/cn';
import { getOccupancyStatus, formatCurrency } from '../utils/formatters';

import {
  Users,
  DollarSign,
  Plus,
  Download,
  User,
  Building2,
  Percent,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

export const DedicatedResources: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedView, setSelectedView] = useState<'allocations' | 'utilization' | 'bench'>('allocations');

  // Sample allocations data (in production, this would come from storage/API)
  const allocations = [
    {
      id: 'alloc-001',
      resourceId: 'res-001',
      resourceName: 'Karimunnisa',
      projectId: 'proj-001',
      projectName: 'Infynix - Customer Portal',
      allocationPercentage: 100,
      startDate: new Date('2024-07-01'),
      endDate: undefined,
      billingRate: 22,
      isDedicated: true
    },
    {
      id: 'alloc-002',
      resourceId: 'res-002',
      resourceName: 'Krishna Santhosh',
      projectId: 'proj-002',
      projectName: 'MGBPL - B2C E-commerce',
      allocationPercentage: 50,
      startDate: new Date('2024-08-01'),
      endDate: new Date('2025-12-31'),
      billingRate: 24,
      isDedicated: true
    },
    {
      id: 'alloc-003',
      resourceId: 'res-003',
      resourceName: 'Tarun',
      projectId: 'proj-004',
      projectName: 'Oneflow - V1.5',
      allocationPercentage: 100,
      startDate: new Date('2024-09-01'),
      endDate: undefined,
      billingRate: 26,
      isDedicated: true
    }
  ];

  // Calculate statistics
  const totalAllocated = allocations.length;
  const totalRevenue = allocations.reduce((acc, a) => 
    acc + (a.billingRate * a.allocationPercentage * 160 / 100), 0
  );
  const avgUtilization = Math.round(allocations.reduce((acc, a) => acc + a.allocationPercentage, 0) / totalAllocated);
  const benchResources = mockResources.filter(r => r.occupancyPercentage < 50);

  const stats = [
    { label: 'Total Allocations', value: totalAllocated, icon: Users, color: 'bg-blue-500' },
    { label: 'Monthly Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { label: 'Avg Utilization', value: `${avgUtilization}%`, icon: Percent, color: 'bg-purple-500' },
    { label: 'Available Resources', value: benchResources.length, icon: User, color: 'bg-green-500' },
  ];

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dedicated Resources</h1>
          <p className="text-gray-500 mt-1">Manage dedicated resource allocations and billing</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
          >
            <Plus className="w-4 h-4" />
            Assign Resource
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

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'allocations', label: 'Allocations', icon: Users },
            { id: 'utilization', label: 'Utilization Report', icon: BarChart3 },
            { id: 'bench', label: 'Bench Resources', icon: User }
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as typeof selectedView)}
                className={cn(
                  'flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors',
                  selectedView === view.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="w-5 h-5" />
                {view.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Allocations View */}
      {selectedView === 'allocations' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billing Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {allocations.map((allocation) => (
                <tr key={allocation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {allocation.resourceName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{allocation.resourceName}</p>
                        <p className="text-xs text-gray-500">Dedicated</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{allocation.projectName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full', getOccupancyColor(allocation.allocationPercentage))}
                          style={{ width: `${allocation.allocationPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{allocation.allocationPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(allocation.startDate)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {allocation.endDate ? formatDate(allocation.endDate) : 'Ongoing'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    ${allocation.billingRate}/hr
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">
                    ${((allocation.billingRate * allocation.allocationPercentage * 160) / 100).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Utilization View */}
      {selectedView === 'utilization' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockResources.slice(0, 6).map((resource) => {
            const status = getOccupancyStatus(resource.occupancyPercentage);
            return (
              <div key={resource.id} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {resource.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                    <p className="text-sm text-gray-500">{resource.department}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Occupancy</span>
                      <span className="font-medium text-gray-900">{resource.occupancyPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', status.color)}
                        style={{ width: `${resource.occupancyPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Current Projects</p>
                      <p className="font-medium text-gray-900">{resource.currentProjects.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Hourly Rate</p>
                      <p className="font-medium text-gray-900">${resource.hourlyRate}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bench View */}
      {selectedView === 'bench' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Available Resources</h3>
              <p className="text-sm text-gray-500">Resources with less than 50% occupancy</p>
            </div>
          </div>
          
          {benchResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benchResources.map((resource) => {
                const status = getOccupancyStatus(resource.occupancyPercentage);
                return (
                  <div key={resource.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {resource.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{resource.name}</p>
                        <p className="text-xs text-gray-500">{resource.department}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Availability</span>
                        <span className="font-medium text-green-600">{100 - resource.occupancyPercentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full', status.color)}
                          style={{ width: `${resource.occupancyPercentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-gray-500">Hourly Rate</span>
                        <span className="font-medium text-gray-900">${resource.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-300 mx-auto mb-4" />
              <p className="text-gray-500">All resources are fully allocated</p>
            </div>
          )}
        </div>
      )}

      {/* Dedicated Resource Form Modal */}
      <DedicatedResourceForm
        allocation={null}
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={() => setShowForm(false)}
      />
    </div>
  );
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
