// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// RESOURCES PAGE
// ==========================================

import React, { useState } from 'react';
import { mockResources } from '../data/mockData';
import { cn } from '../utils/cn';
import { getOccupancyStatus } from '../utils/formatters';

import {
  Search,
  User,
  Briefcase,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Download
} from 'lucide-react';

export const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDepartment === 'all' || resource.department === selectedDepartment;
    
    return matchesSearch && matchesDept;
  });

  const departments = [...new Set(mockResources.map(r => r.department))];

  // Calculate statistics
  const totalResources = mockResources.length;
  const avgOccupancy = Math.round(mockResources.reduce((acc, r) => acc + r.occupancyPercentage, 0) / totalResources);
  const fullyOccupied = mockResources.filter(r => r.occupancyPercentage >= 90).length;
  const available = mockResources.filter(r => r.occupancyPercentage < 70).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-500 mt-1">Track team availability and allocation</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total Resources</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalResources}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Avg Occupancy</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{avgOccupancy}%</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Fully Occupied</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fullyOccupied}</p>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Available</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{available}</p>
        </div>
      </div>

      {/* Occupancy Heatmap */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Occupancy Heatmap</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mockResources.map((resource) => {
            const status = getOccupancyStatus(resource.occupancyPercentage);
            return (
              <div 
                key={resource.id} 
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium mb-2">
                    {resource.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <p className="font-medium text-gray-900 text-sm truncate w-full">{resource.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{resource.department.split(' - ')[1] || resource.department}</p>
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">{resource.occupancyPercentage}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', status.color)}
                        style={{ width: `${resource.occupancyPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupancy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredResources.map((resource) => {
              const status = getOccupancyStatus(resource.occupancyPercentage);
              return (
                <tr key={resource.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {resource.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{resource.name}</p>
                        <p className="text-sm text-gray-500">{resource.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{resource.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {resource.skills.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{resource.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full', status.color)}
                          style={{ width: `${resource.occupancyPercentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{resource.occupancyPercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{resource.currentProjects.length} active</td>
                  <td className="px-6 py-4 text-sm text-gray-600">${resource.hourlyRate}/hr</td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
