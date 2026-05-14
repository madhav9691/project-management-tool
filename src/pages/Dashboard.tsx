// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// DASHBOARD PAGE
// ==========================================

import React from 'react';
import { StatCard } from '../components/Dashboard/StatCard';
import { 
  ResourceOccupancyChart, 
  ProjectCompletionChart, 
  CollectionsChart,
  ProjectTypeDistribution,
  TaskStatusChart
} from '../components/Dashboard/Charts';
import { mockDashboardStats, mockProjects, mockTasks, mockMaintenanceProjects } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../utils/cn';

import {
  Briefcase,
  Clock,
  AlertTriangle,
  Shield,
  Wallet,
  CheckCircle2,
  TrendingUp,
  Calendar,
  ArrowRight,
  Activity,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = mockDashboardStats;
  
  // Calculate additional metrics
  const recentProjects = mockProjects.slice(0, 5);
  const highPriorityTasks = mockTasks.filter(t => t.priority === 'High' || t.priority === 'Critical');
  
  // Get expiring items
  const expiringSSL = mockMaintenanceProjects.filter(m => {
    if (!m.sslExpiryDate) return false;
    const daysLeft = Math.ceil((m.sslExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">BU3 Team Overview</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
            24 Resources
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Running Projects"
          value={stats.totalRunningProjects}
          icon={Briefcase}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Dedicated Projects"
          value={stats.totalDedicatedProjects}
          icon={UserCheck}
          color="green"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Maintenance Projects"
          value={stats.totalMaintenanceProjects}
          icon={Shield}
          color="orange"
          trend={{ value: 5, isPositive: false }}
        />
        <StatCard
          title="Pending Collections"
          value={formatCurrency(stats.pendingCollections)}
          icon={Wallet}
          color="purple"
          subtitle="Due this month"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500">Live Projects</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.liveProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500">UAT Projects</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.uatProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-500">Delayed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.delayedProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500">High Risk</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.highRiskProjects}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500">Renewals</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.upcomingRenewals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-500">SSL Alerts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.sslExpiryAlerts}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResourceOccupancyChart />
        <ProjectCompletionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CollectionsChart />
        <ProjectTypeDistribution />
        <TaskStatusChart />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Active Projects</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProjects.map((project) => (
              <div key={project.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-gray-900">{project.projectName}</h4>
                    <span className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded-full',
                      project.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                      project.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                      project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    )}>
                      {project.priority}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{project.completionPercentage}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>{project.clientCompany}</span>
                    <span>•</span>
                    <span>{project.assignedTeamMembers.length} members</span>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    project.currentPhase === 'Live' ? 'bg-green-100 text-green-700' :
                    project.currentPhase === 'UAT' ? 'bg-purple-100 text-purple-700' :
                    project.currentPhase === 'QA' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  )}>
                    {project.currentPhase}
                  </span>
                </div>
                <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full',
                      project.completionPercentage >= 90 ? 'bg-green-500' :
                      project.completionPercentage >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    )}
                    style={{ width: `${project.completionPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Alerts & Reminders</h3>
          </div>
          <div className="p-4 space-y-3">
            {expiringSSL.length > 0 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-900">SSL Certificates Expiring</p>
                  <p className="text-xs text-orange-700 mt-1">
                    {expiringSSL.length} projects have SSL certificates expiring within 30 days
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">High Priority Tasks</p>
                <p className="text-xs text-red-700 mt-1">
                  {highPriorityTasks.length} tasks need immediate attention
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Weekly Meeting</p>
                <p className="text-xs text-blue-700 mt-1">
                  Next board meeting scheduled for Wednesday
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Resource Utilization</p>
                <p className="text-xs text-green-700 mt-1">
                  {stats.occupiedResources}% occupancy rate this week
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
