import React, { useState, useEffect } from 'react';
import { mockMilestones } from '../data/mockData';
import { MilestoneForm } from '../components/Milestones/MilestoneForm';
import { getMilestonesFromStorage, saveMilestonesToStorage, getProjectsFromStorage } from '../utils/storage';
import type { Milestone, MilestoneCategory, Project } from '../types';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CheckCircle2, Clock, AlertCircle, Download, Plus, Search, DollarSign, Edit2, Trash2, ChevronDown, ChevronUp, FolderKanban, Target, TrendingUp, Eye, X } from 'lucide-react';

type ViewMode = 'all' | 'project' | 'sales' | 'operational';

export const Milestones: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Partial' | 'Received'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('project');
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [viewingMilestone, setViewingMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    const sm = getMilestonesFromStorage();
    setMilestones(sm.length > 0 ? sm : (() => { saveMilestonesToStorage(mockMilestones); return mockMilestones; })());
    setProjects(getProjectsFromStorage());
  }, []);

  const persist = (u: Milestone[]) => { setMilestones(u); saveMilestonesToStorage(u); };

  const handleSave = async (data: Partial<Milestone>) => {
    if (editingMilestone) {
      persist(milestones.map(m => m.id === editingMilestone.id ? { ...m, ...data } as Milestone : m));
    } else {
      persist([...milestones, { ...data, id: `mil-${Date.now()}`, category: data.category || 'sales' } as Milestone]);
    }
    setShowForm(false); setEditingMilestone(null);
  };

  const handleEdit = (m: Milestone) => { setEditingMilestone(m); setShowForm(true); };
  const handleDelete = (id: string) => { if (window.confirm('Delete this milestone?')) persist(milestones.filter(m => m.id !== id)); };

  // Filter
  const filtered = milestones.filter(m => {
    const ms = !searchQuery || m.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || m.name.toLowerCase().includes(searchQuery.toLowerCase());
    const mst = statusFilter === 'all' || m.paymentStatus === statusFilter;
    const mvc = viewMode === 'all' || viewMode === 'project' || m.category === viewMode;
    return ms && mst && mvc;
  });

  // Grouping
  const byProject: Record<string, Milestone[]> = {};
  filtered.forEach(m => { (byProject[m.projectName] = byProject[m.projectName] || []).push(m); });

  // Stats
  const salesMilestones = milestones.filter(m => m.category === 'sales');
  const opMilestones = milestones.filter(m => m.category === 'operational');
  const totalSales = salesMilestones.reduce((a, m) => a + m.amount, 0);
  const received = salesMilestones.filter(m => m.paymentStatus === 'Received').reduce((a, m) => a + m.amount, 0);
  const pending = salesMilestones.filter(m => m.paymentStatus === 'Pending').reduce((a, m) => a + m.amount, 0);
  const overdue = salesMilestones.filter(m => m.paymentStatus === 'Pending' && new Date(m.dueDate) < new Date()).length;
  const opPending = opMilestones.filter(m => m.paymentStatus === 'Pending').length;
  const opDone = opMilestones.filter(m => m.paymentStatus === 'Received').length;

  const toggle = (k: string) => setCollapsed(p => ({ ...p, [k]: !p[k] }));
  const catBadge = (c: MilestoneCategory) => c === 'sales' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  const catLabel = (c: MilestoneCategory) => c === 'sales' ? '💰 Sales' : '🎯 Operational';
  const statusBadge = (s: string) => s === 'Received' ? 'bg-green-100 text-green-700' : s === 'Partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Milestones & Payments</h1>
          <p className="text-gray-500 mt-1">Project-wise sales & operational milestones tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"><Download className="w-4 h-4" /> Export</button>
          <button onClick={() => { setEditingMilestone(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20"><Plus className="w-4 h-4" /> Add Milestone</button>
        </div>
      </div>

      {/* Stats — Split Sales vs Operational */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="flex items-center gap-2 mb-2"><DollarSign className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Total Sales</span></div><p className="text-xl font-bold text-gray-900">{formatCurrency(totalSales)}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">Received</span></div><p className="text-xl font-bold text-green-600">{formatCurrency(received)}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-500">Pending</span></div><p className="text-xl font-bold text-yellow-600">{formatCurrency(pending)}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-red-500" /><span className="text-xs text-gray-500">Overdue</span></div><p className="text-xl font-bold text-red-600">{overdue}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-blue-500" /><span className="text-xs text-gray-500">Op. Pending</span></div><p className="text-xl font-bold text-blue-600">{opPending}</p></div>
        <div className="bg-white p-4 rounded-xl border border-gray-200"><div className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-xs text-gray-500">Op. Done</span></div><p className="text-xl font-bold text-green-600">{opDone}</p></div>
      </div>

      {/* View Mode + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'project' as ViewMode, label: 'By Project', icon: FolderKanban },
            { id: 'sales' as ViewMode, label: 'Sales', icon: DollarSign },
            { id: 'operational' as ViewMode, label: 'Operational', icon: Target },
            { id: 'all' as ViewMode, label: 'All', icon: TrendingUp },
          ].map(vm => { const I = vm.icon; return (
            <button key={vm.id} onClick={() => setViewMode(vm.id)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors', viewMode === vm.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
              <I className="w-4 h-4" /> {vm.label}
            </button>
          ); })}
        </div>
        <div className="flex-1 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search milestones..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-1.5">
            {(['all', 'Pending', 'Partial', 'Received'] as const).map(st => (
              <button key={st} onClick={() => setStatusFilter(st)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', statusFilter === st ? 'bg-blue-100 text-blue-700' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50')}>{st === 'all' ? 'All' : st}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ PROJECT-WISE VIEW ═══ */}
      {viewMode === 'project' && (
        <div className="space-y-4">
          {Object.keys(byProject).length === 0 && <p className="text-center py-12 text-gray-400">No milestones match your filters</p>}
          {Object.entries(byProject).map(([projectName, pMilestones]) => {
            const proj = projects.find(p => p.projectName === projectName);
            const isOpen = !collapsed[projectName];
            const salesTotal = pMilestones.filter(m => m.category === 'sales').reduce((a, m) => a + m.amount, 0);
            const salesReceived = pMilestones.filter(m => m.category === 'sales' && m.paymentStatus === 'Received').reduce((a, m) => a + m.amount, 0);
            const salesPending = pMilestones.filter(m => m.category === 'sales' && m.paymentStatus !== 'Received').reduce((a, m) => a + m.amount, 0);
            const opTotal = pMilestones.filter(m => m.category === 'operational').length;
            const opCompleted = pMilestones.filter(m => m.category === 'operational' && m.paymentStatus === 'Received').length;
            return (
              <div key={projectName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button onClick={() => toggle(projectName)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><FolderKanban className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{projectName}</h3>
                      <p className="text-xs text-gray-500">{proj?.projectNumber || ''} • {pMilestones.length} milestones</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-4 text-xs">
                      <span className="text-green-600 font-medium">💰 Received: {formatCurrency(salesReceived)}</span>
                      <span className="text-red-600 font-medium">⏳ Pending: {formatCurrency(salesPending)}</span>
                      <span className="text-blue-600 font-medium">🎯 Ops: {opCompleted}/{opTotal}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-200">
                    {/* Project summary bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-3 bg-gray-50">
                      <div className="text-center"><p className="text-xs text-gray-500">Sales Total</p><p className="font-bold text-gray-900">{formatCurrency(salesTotal)}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Received</p><p className="font-bold text-green-600">{formatCurrency(salesReceived)}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Pending</p><p className="font-bold text-red-600">{formatCurrency(salesPending)}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Ops Done</p><p className="font-bold text-blue-600">{opCompleted}/{opTotal}</p></div>
                    </div>
                    {/* Split: Sales + Operational */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                      {/* Sales Column */}
                      <div className="p-4">
                        <h4 className="font-semibold text-green-700 text-sm mb-3 flex items-center gap-2">💰 Sales Milestones</h4>
                        <div className="space-y-2">
                          {pMilestones.filter(m => m.category === 'sales').map(m => (
                            <div key={m.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.type} • {formatDate(m.dueDate)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-sm text-gray-900">{formatCurrency(m.amount)}</p>
                                <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', statusBadge(m.paymentStatus))}>{m.paymentStatus}</span>
                                <button onClick={() => handleEdit(m)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(m.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                          {pMilestones.filter(m => m.category === 'sales').length === 0 && <p className="text-xs text-gray-400 text-center py-4">No sales milestones</p>}
                        </div>
                      </div>
                      {/* Operational Column */}
                      <div className="p-4">
                        <h4 className="font-semibold text-blue-700 text-sm mb-3 flex items-center gap-2">🎯 Operational Milestones</h4>
                        <div className="space-y-2">
                          {pMilestones.filter(m => m.category === 'operational').map(m => (
                            <div key={m.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                                <p className="text-xs text-gray-500">{m.type} • {formatDate(m.dueDate)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', m.paymentStatus === 'Received' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>{m.paymentStatus === 'Received' ? '✅ Done' : '⏳ Pending'}</span>
                                <button onClick={() => handleEdit(m)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDelete(m.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                          {pMilestones.filter(m => m.category === 'operational').length === 0 && <p className="text-xs text-gray-400 text-center py-4">No operational milestones</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ TABLE VIEW (sales / operational / all) ═══ */}
      {viewMode !== 'project' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Milestone</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Project</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 uppercase w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', catBadge(m.category))}>{catLabel(m.category)}</span></td>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900 text-sm">{m.name}</p>{m.notes && <p className="text-xs text-gray-500 mt-0.5">{m.notes}</p>}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.projectName}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded-full">{m.type}</span></td>
                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{m.amount > 0 ? formatCurrency(m.amount) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(m.dueDate)}</td>
                  <td className="px-4 py-3"><span className={cn('px-2 py-0.5 text-[10px] font-medium rounded-full', statusBadge(m.paymentStatus))}>{m.paymentStatus}</span></td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.invoiceNumber || '—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <button onClick={() => setViewingMilestone(m)} className="p-1 text-green-500 hover:bg-green-50 rounded"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleEdit(m)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-12 text-gray-400">No milestones match your filters</p>}
        </div>
      )}

      {/* Milestone Form */}
      <MilestoneForm milestone={editingMilestone} isOpen={showForm} onClose={() => { setShowForm(false); setEditingMilestone(null); }} onSave={handleSave} />

      {/* View Modal */}
      {viewingMilestone && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Milestone Details</h3>
              <button onClick={() => setViewingMilestone(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2"><span className={cn('px-3 py-1 text-sm rounded-full', catBadge(viewingMilestone.category))}>{catLabel(viewingMilestone.category)}</span><span className={cn('px-3 py-1 text-sm rounded-full', statusBadge(viewingMilestone.paymentStatus))}>{viewingMilestone.paymentStatus}</span></div>
              <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Milestone</p><p className="font-medium text-gray-900">{viewingMilestone.name}</p></div>
                <div><p className="text-gray-500">Project</p><p className="font-medium text-gray-900">{viewingMilestone.projectName}</p></div>
                <div><p className="text-gray-500">Type</p><p className="font-medium text-gray-900">{viewingMilestone.type}</p></div>
                <div><p className="text-gray-500">Due Date</p><p className="font-medium text-gray-900">{formatDate(viewingMilestone.dueDate)}</p></div>
                {viewingMilestone.amount > 0 && <div><p className="text-gray-500">Amount</p><p className="font-bold text-green-600 text-lg">{formatCurrency(viewingMilestone.amount)}</p></div>}
                {viewingMilestone.invoiceNumber && <div><p className="text-gray-500">Invoice</p><p className="font-medium text-gray-900">{viewingMilestone.invoiceNumber}</p></div>}
                {viewingMilestone.paymentReceivedDate && <div><p className="text-gray-500">Received On</p><p className="font-medium text-gray-900">{formatDate(viewingMilestone.paymentReceivedDate)}</p></div>}
              </div>
              {viewingMilestone.notes && <div className="bg-yellow-50 p-3 rounded-lg"><p className="text-sm text-yellow-800">{viewingMilestone.notes}</p></div>}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => { setViewingMilestone(null); handleEdit(viewingMilestone); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
                <button onClick={() => setViewingMilestone(null)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
