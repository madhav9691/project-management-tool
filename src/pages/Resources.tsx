import React, { useState, useEffect } from 'react';
import { mockResources } from '../data/mockData';
import { ResourceForm } from '../components/Resources/ResourceForm';
import { getResourcesFromStorage, saveResourcesToStorage, getProjectsFromStorage } from '../utils/storage';
import type { Resource, Project } from '../types';
import { cn } from '../utils/cn';
import { Search, User, Briefcase, TrendingUp, Calendar, Plus, Edit2, Trash2, Eye, X, Zap } from 'lucide-react';

export const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Load data
  useEffect(() => {
    const sr = getResourcesFromStorage();
    setResources(sr.length > 0 ? sr : (() => { saveResourcesToStorage(mockResources); return mockResources; })());
    setProjects(getProjectsFromStorage());
  }, []);

  // Calculate occupancy from project assignments
  const getComputedOccupancy = (resource: Resource): { pct: number; projectCount: number; projectList: string[] } => {
    const assigned = projects.filter(p =>
      (p.assignedTeamMembers || []).includes(resource.name) || (p.primaryResources || []).includes(resource.name)
    );
    const pList = assigned.map(p => p.projectName);
    // Each active project adds ~25% occupancy, primary resources add 35%
    let occ = 0;
    for (const p of assigned) {
      if (p.status !== 'Active' && p.status !== 'On Hold') continue;
      occ += (p.primaryResources || []).includes(resource.name) ? 35 : 25;
    }
    // Use manual override if set and higher
    const manual = resource.occupancyPercentage || 0;
    const final = Math.max(manual, Math.min(occ, 100));
    return { pct: final, projectCount: assigned.length, projectList: pList };
  };

  const persist = (updated: Resource[]) => { setResources(updated); saveResourcesToStorage(updated); };

  const handleSaveResource = async (data: Partial<Resource>) => {
    if (editingResource) {
      persist(resources.map(r => r.id === editingResource.id ? { ...r, ...data } as Resource : r));
    } else {
      const newRes: Resource = {
        id: `res-${Date.now()}`, name: data.name || '', email: data.email || '',
        role: data.role || 'developer', department: data.department || 'Web Development',
        skills: data.skills || [], hourlyRate: data.hourlyRate || 20, availability: data.availability || 40,
        currentProjects: [], occupancyPercentage: data.occupancyPercentage || 0,
        joinDate: new Date(), isActive: data.isActive ?? true, allocations: []
      };
      persist([...resources, newRes]);
    }
    setShowResourceForm(false); setEditingResource(null);
  };

  const handleEditResource = (resource: Resource) => { setEditingResource(resource); setShowResourceForm(true); };
  const handleDeleteResource = (id: string) => { if (window.confirm('Delete this resource?')) persist(resources.filter(r => r.id !== id)); };

  // Inline occupancy update
  const handleOccupancyChange = (id: string, val: number) => {
    persist(resources.map(r => r.id === id ? { ...r, occupancyPercentage: val } : r));
  };

  const filteredResources = resources.filter(r => {
    const ms = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.email.toLowerCase().includes(searchQuery.toLowerCase()) || r.skills.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    const md = selectedDepartment === 'all' || r.department === selectedDepartment;
    return ms && md;
  });

  const departments = [...new Set(resources.map(r => r.department))];
  const total = resources.length;
  const avgOcc = total > 0 ? Math.round(resources.reduce((a, r) => a + (getComputedOccupancy(r).pct), 0) / total) : 0;
  const fullyOcc = resources.filter(r => getComputedOccupancy(r).pct >= 90).length;
  const available = resources.filter(r => getComputedOccupancy(r).pct < 50).length;

  const occColor = (pct: number) => pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500';
  const occLabel = (pct: number) => pct >= 90 ? 'Fully Occupied' : pct >= 70 ? 'Partially Busy' : pct >= 50 ? 'Moderate' : pct > 0 ? 'Light' : 'Available';
  const occBadge = (pct: number) => pct >= 90 ? 'bg-red-100 text-red-700' : pct >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resource Management</h1>
          <p className="text-gray-500 mt-1">Track team availability, occupancy and allocation</p>
        </div>
        <button onClick={() => { setEditingResource(null); setShowResourceForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
          <Plus className="w-4 h-4" /> Add Resource
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: total, icon: User, color: 'bg-blue-500' },
          { label: 'Avg Occupancy', value: `${avgOcc}%`, icon: TrendingUp, color: 'bg-purple-500' },
          { label: 'Fully Occupied', value: fullyOcc, icon: Briefcase, color: 'bg-red-500' },
          { label: 'Available', value: available, icon: Calendar, color: 'bg-green-500' },
        ].map(st => {
          const Icon = st.icon;
          return (
            <div key={st.label} className="bg-white p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 ${st.color.replace('500', '100')} rounded-lg`}><Icon className={`w-5 h-5 ${st.color.replace('bg-', 'text-')}`} /></div>
                <span className="text-sm text-gray-500">{st.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{st.value}</p>
            </div>
          );
        })}
      </div>

      {/* Occupancy Heatmap */}
      <div className="bg-white p-5 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Occupancy Heatmap</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {resources.map(r => {
            const { pct, projectCount } = getComputedOccupancy(r);
            return (
              <div key={r.id} className="flex flex-col items-center text-center p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setViewingResource(r)}>
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs mb-1', occColor(pct))}>
                  {pct}%
                </div>
                <p className="text-xs font-medium text-gray-900 truncate w-full">{r.name}</p>
                <p className="text-[10px] text-gray-400">{projectCount} proj</p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /> 0–49% Available</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /> 50–89% Busy</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /> 90–100% Full</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, email or skill..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <select value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
          <option value="all">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Resource</th>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Department</th>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Skills</th>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase w-52">Occupancy</th>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Projects</th>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Rate</th>
              <th className="px-5 py-3 text-left text-[10px] font-medium text-gray-500 uppercase w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredResources.map(r => {
              const { pct, projectCount, projectList } = getComputedOccupancy(r);
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs', occColor(pct))}>
                        {r.name.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{r.department}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.skills.slice(0, 3).map((sk: string) => <span key={sk} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">{sk}</span>)}
                      {r.skills.length > 3 && <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">+{r.skills.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all', occColor(pct))} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={cn('px-1.5 py-0.5 text-[10px] font-medium rounded', occBadge(pct))}>{pct}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="range" min="0" max="100" step="5" value={pct}
                          onChange={e => handleOccupancyChange(r.id, parseInt(e.target.value))}
                          className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <span className="text-[10px] text-gray-400">{occLabel(pct)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{projectCount}</span>
                      <span className="text-xs text-gray-400 ml-1">active</span>
                    </div>
                    {projectList.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {projectList.slice(0, 2).map((p, i) => <span key={i} className="text-[9px] text-blue-600 bg-blue-50 px-1 py-0.5 rounded">{p}</span>)}
                        {projectList.length > 2 && <span className="text-[9px] text-gray-400">+{projectList.length - 2}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">${r.hourlyRate}/hr</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewingResource(r)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEditResource(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteResource(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resource Form */}
      <ResourceForm resource={editingResource} isOpen={showResourceForm}
        onClose={() => { setShowResourceForm(false); setEditingResource(null); }}
        onSave={handleSaveResource} />

      {/* Resource View Modal */}
      {viewingResource && (() => {
        const { pct, projectList } = getComputedOccupancy(viewingResource);
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-6">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white font-bold', occColor(pct))}>
                    {viewingResource.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{viewingResource.name}</h3>
                    <p className="text-sm text-gray-500">{viewingResource.email}</p>
                  </div>
                </div>
                <button onClick={() => setViewingResource(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full capitalize">{viewingResource.role.replace('_', ' ')}</span>
                  <span className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">{viewingResource.department}</span>
                  <span className={cn('px-3 py-1 text-sm rounded-full', occBadge(pct))}>{pct}% — {occLabel(pct)}</span>
                </div>

                {/* Occupancy Visual */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Occupancy</h4>
                  <div className="h-5 bg-gray-200 rounded-full overflow-hidden relative mb-2">
                    <div className={cn('h-full rounded-full transition-all', occColor(pct))} style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">{pct}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div><p className="text-gray-500">Occupied</p><p className="font-bold text-gray-900">{pct}%</p></div>
                    <div><p className="text-gray-500">Free Capacity</p><p className="font-bold text-green-600">{100 - pct}%</p></div>
                    <div><p className="text-gray-500">Free Hours/Week</p><p className="font-bold text-gray-900">{Math.round((viewingResource.availability || 40) * (100 - pct) / 100)}h</p></div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Hourly Rate</p><p className="font-bold text-gray-900">${viewingResource.hourlyRate}/hr</p></div>
                  <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500">Availability</p><p className="font-bold text-gray-900">{viewingResource.availability} hrs/week</p></div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingResource.skills.map((sk, i) => <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">{sk}</span>)}
                  </div>
                </div>

                {/* Projects */}
                {projectList.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Assigned Projects ({projectList.length})</h4>
                    <div className="space-y-1">
                      {projectList.map((p, i) => <div key={i} className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">{p}</div>)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button onClick={() => { setViewingResource(null); handleEditResource(viewingResource); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Edit2 className="w-4 h-4" /> Edit Resource</button>
                  <button onClick={() => setViewingResource(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
