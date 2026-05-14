// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// DASHBOARD CHARTS
// ==========================================

import React from 'react';
import {
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Resource Occupancy Data
const occupancyData = [
  { name: 'Week 1', occupied: 75, available: 25 },
  { name: 'Week 2', occupied: 80, available: 20 },
  { name: 'Week 3', occupied: 85, available: 15 },
  { name: 'Week 4', occupied: 82, available: 18 },
  { name: 'Week 5', occupied: 88, available: 12 },
  { name: 'Week 6', occupied: 90, available: 10 },
];

// Project Completion Data
const completionData = [
  { name: 'E-Commerce App', completed: 75, remaining: 25 },
  { name: 'Healthcare Dashboard', completed: 60, remaining: 40 },
  { name: 'Fitness Tracking', completed: 90, remaining: 10 },
  { name: 'Inventory System', completed: 35, remaining: 65 },
  { name: 'Real Estate Portal', completed: 20, remaining: 80 },
];

// Collections Data
const collectionsData = [
  { month: 'Jan', target: 50000, received: 45000 },
  { month: 'Feb', target: 55000, received: 52000 },
  { month: 'Mar', target: 60000, received: 58000 },
  { month: 'Apr', target: 58000, received: 55000 },
  { month: 'May', target: 65000, received: 62000 },
  { month: 'Jun', target: 70000, received: 48000 },
];

// Project Type Distribution
const projectTypeData = [
  { name: 'Running', value: 4, color: '#3B82F6' },
  { name: 'Dedicated', value: 1, color: '#10B981' },
  { name: 'Maintenance', value: 3, color: '#F59E0B' },
];

// Task Status Data
const taskStatusData = [
  { name: 'Open', count: 5, color: '#6B7280' },
  { name: 'In Progress', count: 12, color: '#3B82F6' },
  { name: 'QA', count: 8, color: '#8B5CF6' },
  { name: 'Completed', count: 25, color: '#10B981' },
];

export const ResourceOccupancyChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Occupancy Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={occupancyData}>
          <defs>
            <linearGradient id="colorOccupied" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="occupied" 
            name="Occupied %" 
            stroke="#3B82F6" 
            fillOpacity={1} 
            fill="url(#colorOccupied)" 
          />
          <Line type="monotone" dataKey="available" name="Available %" stroke="#10B981" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProjectCompletionChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Completion Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={completionData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
          <XAxis type="number" stroke="#6B7280" fontSize={12} />
          <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} width={120} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          <Bar dataKey="completed" name="Completed %" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} />
          <Bar dataKey="remaining" name="Remaining %" stackId="a" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CollectionsChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Collections Report</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={collectionsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip 
            formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, '']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend />
          <Bar dataKey="target" name="Target" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="received" name="Received" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ProjectTypeDistribution: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={projectTypeData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {projectTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TaskStatusChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Status Overview</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={taskStatusData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
          <YAxis stroke="#6B7280" fontSize={12} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {taskStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
