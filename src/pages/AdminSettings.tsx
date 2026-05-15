import React, { useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { DataAPI } from '../services/api';
import type { User } from '../types';
import { cn } from '../utils/cn';
import { Users, Shield, Database, Trash2, Download, Edit2, X, Save, Server, HardDrive, AlertCircle } from 'lucide-react';

type Tab = 'users' | 'roles' | 'system' | 'data';

export const AdminSettings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [stats, setStats] = useState({ projects: 0, tasks: 0, resources: 0, milestones: 0, notifications: 0, storageUsed: 0 });

  useEffect(() => { DataAPI.getStats().then(setStats); }, [activeTab]);

  const openEditUser = (u: User) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, department: u.department, isActive: u.isActive });
    setShowEditModal(true);
  };

  const saveUser = () => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
    setShowEditModal(false); setEditingUser(null);
  };

  const clearModule = async (module: 'projects' | 'tasks' | 'resources' | 'milestones' | 'meetings' | 'notifications', label: string) => {
    if (window.confirm(`Clear all ${label}? Original sample data will reload on next visit.`)) {
      await DataAPI.clearModule(module);
      DataAPI.getStats().then(setStats);
    }
  };

  const clearAllData = async () => {
    if (window.confirm('⚠️ DANGER: This will delete ALL data. Are you sure?')) {
      await DataAPI.clearAll();
      window.location.reload();
    }
  };

  const exportData = async () => {
    const data = await DataAPI.exportAll();
    const blob = new Blob([JSON.stringify({ ...data, exportedBy: currentUser?.name }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `krify-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const roles = [
    { role: 'super_admin', label: 'Super Admin', color: 'bg-red-100 text-red-700', permissions: 'Full access to all modules, settings, and data management' },
    { role: 'management', label: 'Management', color: 'bg-purple-100 text-purple-700', permissions: 'View all data, manage projects, reports, and team' },
    { role: 'project_manager', label: 'Project Manager', color: 'bg-blue-100 text-blue-700', permissions: 'Create/edit projects, assign tasks, manage milestones, view reports' },
    { role: 'team_lead', label: 'Team Lead', color: 'bg-indigo-100 text-indigo-700', permissions: 'View all projects/tasks, manage team tasks' },
    { role: 'developer', label: 'Developer', color: 'bg-green-100 text-green-700', permissions: 'View assigned projects/tasks, update task status and hours' },
    { role: 'qa', label: 'QA Engineer', color: 'bg-yellow-100 text-yellow-700', permissions: 'View assigned projects/tasks, update QA status' },
    { role: 'sales_coordinator', label: 'Sales Coordinator', color: 'bg-orange-100 text-orange-700', permissions: 'View all projects, manage client details and milestones' },
  ];

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'system', label: 'System Info', icon: Server },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1><p className="text-gray-500 mt-1">System configuration, users, roles and data management</p></div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map(t => { const I = t.icon; return (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap flex-1 justify-center', activeTab === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
            <I className="w-4 h-4" /> {t.label}
          </button>
        ); })}
      </div>

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <div className="px-5 py-4 border-b border-gray-200"><h3 className="font-semibold text-gray-900">System Users ({users.length})</h3></div>
          <table className="w-full"><thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">User</th>
            <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Email</th>
            <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Role</th>
            <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Department</th>
            <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500">Status</th>
            <th className="px-4 py-3 text-left text-[10px] uppercase text-gray-500 w-20">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100">{users.map(u => {
            const ri = roles.find(r => r.role === u.role);
            return (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">{u.name.split(' ').map(n => n[0]).join('')}</div><span className="font-medium text-gray-900 text-sm">{u.name}</span></div></td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full capitalize', ri?.color)}>{u.role.replace('_', ' ')}</span></td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.department}</td>
                <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] rounded-full', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-4 py-3"><button onClick={() => openEditUser(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button></td>
              </tr>
            );
          })}</tbody></table>
        </div>
      )}

      {/* ROLES */}
      {activeTab === 'roles' && (
        <div className="space-y-4">{roles.map(r => (
          <div key={r.role} className="bg-white p-5 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-gray-400" /><span className={cn('px-3 py-1 text-sm font-medium rounded-full', r.color)}>{r.label}</span></div>
              <span className="text-xs text-gray-400">{users.filter(u => u.role === r.role).length} users</span>
            </div>
            <p className="text-sm text-gray-600">{r.permissions}</p>
            {users.filter(u => u.role === r.role).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">{users.filter(u => u.role === r.role).map(u => (
                <span key={u.id} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">{u.name}</span>
              ))}</div>
            )}
          </div>
        ))}</div>
      )}

      {/* SYSTEM */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Server className="w-5 h-5" /> System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Application</p><p className="font-medium text-gray-900">Krify Project Management Portal</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Version</p><p className="font-medium text-gray-900">1.0.0 (Pilot)</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Tech Stack</p><p className="font-medium text-gray-900">React 19 + TypeScript + Tailwind CSS</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Data Layer</p><p className="font-medium text-gray-900">API Service Layer (Database-ready)</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Current User</p><p className="font-medium text-gray-900">{currentUser?.name} ({currentUser?.role.replace('_', ' ')})</p></div>
              <div className="p-3 bg-gray-50 rounded-lg"><p className="text-gray-500">Business Unit</p><p className="font-medium text-gray-900">BU3 Team</p></div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
            <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-3"><HardDrive className="w-5 h-5" /> Database Status</h3>
            <p className="text-sm text-blue-700 mb-4">All data operations go through the <strong>API Service Layer</strong> (<code>src/services/api.ts</code>). Currently using browser storage as a temporary database. To connect a real database, replace the function bodies in that single file with <code>fetch()</code> calls to your backend API.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { l: 'Projects', v: stats.projects },
                { l: 'Tasks', v: stats.tasks },
                { l: 'Resources', v: stats.resources },
                { l: 'Milestones', v: stats.milestones },
                { l: 'Notifications', v: stats.notifications },
              ].map(s => (
                <div key={s.l} className="p-3 bg-white rounded-lg text-center border border-blue-200">
                  <p className="text-2xl font-bold text-gray-900">{s.v}</p>
                  <p className="text-xs text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DATA MANAGEMENT */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Download className="w-5 h-5" /> Export Data</h3>
            <p className="text-sm text-gray-600 mb-4">Download a complete backup of all data as JSON.</p>
            <button onClick={exportData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow"><Download className="w-4 h-4" /> Export Full Backup</button>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Trash2 className="w-5 h-5" /> Clear Specific Data</h3>
            <p className="text-sm text-gray-600 mb-4">Clear data from individual modules. Sample data reloads on next visit.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { l: 'Projects', m: 'projects' as const, c: stats.projects },
                { l: 'Tasks', m: 'tasks' as const, c: stats.tasks },
                { l: 'Resources', m: 'resources' as const, c: stats.resources },
                { l: 'Milestones', m: 'milestones' as const, c: stats.milestones },
                { l: 'Notifications', m: 'notifications' as const, c: stats.notifications },
                { l: 'Meetings', m: 'meetings' as const, c: 0 },
              ].map(s => (
                <button key={s.l} onClick={() => clearModule(s.m, s.l)} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-left">
                  <div><p className="text-sm font-medium text-gray-900">{s.l}</p><p className="text-xs text-gray-500">{s.c} records</p></div>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              ))}
            </div>
          </div>
          <div className="bg-red-50 p-5 rounded-xl border border-red-200">
            <h3 className="font-semibold text-red-900 flex items-center gap-2 mb-3"><AlertCircle className="w-5 h-5 text-red-600" /> Danger Zone</h3>
            <p className="text-sm text-red-700 mb-4">Permanently delete ALL data. The application reloads with default sample data.</p>
            <button onClick={clearAllData} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"><Trash2 className="w-4 h-4" /> Reset All Data</button>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input type="text" value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={editForm.email || ''} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select value={editForm.role || ''} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{roles.map(r => <option key={r.role} value={r.role}>{r.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input type="text" value={editForm.department || ''} onChange={e => setEditForm(p => ({ ...p, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editForm.isActive ?? true} onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" /><span className="text-sm font-medium text-gray-700">Active User</span></label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
                <button onClick={saveUser} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Save className="w-4 h-4" /> Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
