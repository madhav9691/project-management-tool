// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// TASKS & TICKETS PAGE
// ==========================================

import React, { useState } from 'react';
import { mockTasks } from '../data/mockData';
import type { TaskStatus, TaskPriority } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';

import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  MoreHorizontal
} from 'lucide-react';

const statusConfig: Record<TaskStatus, { color: string; icon: typeof Circle }> = {
  'Open': { color: 'bg-gray-100 text-gray-700', icon: Circle },
  'In Progress': { color: 'bg-blue-100 text-blue-700', icon: Play },
  'QA': { color: 'bg-purple-100 text-purple-700', icon: Clock },
  'Completed': { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  'Reopened': { color: 'bg-red-100 text-red-700', icon: RotateCcw }
};

const priorityConfig: Record<TaskPriority, { color: string; label: string }> = {
  'Critical': { color: 'bg-red-500', label: 'Critical' },
  'High': { color: 'bg-orange-500', label: 'High' },
  'Medium': { color: 'bg-yellow-500', label: 'Medium' },
  'Low': { color: 'bg-green-500', label: 'Low' }
};

export const Tasks: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Group tasks by status
  const tasksByStatus: Record<string, typeof mockTasks> = {
    'Open': filteredTasks.filter(t => t.status === 'Open'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'QA': filteredTasks.filter(t => t.status === 'QA'),
    'Completed': filteredTasks.filter(t => t.status === 'Completed')
  };

  const stats = [
    { label: 'Total Tasks', value: mockTasks.length, color: 'bg-blue-500' },
    { label: 'In Progress', value: mockTasks.filter(t => t.status === 'In Progress').length, color: 'bg-yellow-500' },
    { label: 'In QA', value: mockTasks.filter(t => t.status === 'QA').length, color: 'bg-purple-500' },
    { label: 'Completed', value: mockTasks.filter(t => t.status === 'Completed').length, color: 'bg-green-500' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks & Tickets</h1>
          <p className="text-gray-500 mt-1">Manage and track all project tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-wrap gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="QA">QA</option>
            <option value="Completed">Completed</option>
            <option value="Reopened">Reopened</option>
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {(['Open', 'In Progress', 'QA', 'Completed'] as TaskStatus[]).map((status) => {
          const tasks = tasksByStatus[status];
          const config = statusConfig[status];
          const Icon = config.icon;
          
          return (
            <div key={status} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <h3 className="font-semibold text-gray-900">{status}</h3>
                  <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                    {tasks.length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                {tasks.map((task: typeof mockTasks[0]) => (
                  <div 
                    key={task.id} 
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-gray-500">{task.taskId}</span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority].color}`} />
                      <span className="text-xs text-gray-500">{task.priority}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(task.dueDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimatedHours}h
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {task.assignedTo.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="text-xs text-gray-600">{task.assignedTo}</span>
                      </div>
                      <span className="text-xs text-gray-500">{task.projectName}</span>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks in this status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
