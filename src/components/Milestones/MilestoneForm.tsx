import React, { useState, useEffect } from 'react';
import type { Milestone, MilestoneCategory } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatters';
import { getProjectsFromStorage } from '../../utils/storage';
import type { Project } from '../../types';
import { X, Save, Wallet, DollarSign, FolderKanban, Tag } from 'lucide-react';

interface MilestoneFormProps {
  milestone?: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Partial<Milestone>) => void;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({ milestone, isOpen, onClose, onSave }) => {
  const [f, setF] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => { if (isOpen) setProjects(getProjectsFromStorage()); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (milestone) {
      setF({ projectId: milestone.projectId, projectName: milestone.projectName, name: milestone.name, type: milestone.type, category: milestone.category || 'sales', amount: milestone.amount, dueDate: milestone.dueDate ? formatDate(milestone.dueDate, 'yyyy-MM-dd') : '', invoiceNumber: milestone.invoiceNumber || '', paymentStatus: milestone.paymentStatus, paymentReceivedDate: milestone.paymentReceivedDate ? formatDate(milestone.paymentReceivedDate, 'yyyy-MM-dd') : '', notes: milestone.notes || '' });
    } else {
      setF({ projectId: '', projectName: '', name: '', type: 'Advance', category: 'sales', amount: 0, dueDate: '', invoiceNumber: '', paymentStatus: 'Pending', paymentReceivedDate: '', notes: '' });
    }
    setErrors({});
  }, [milestone, isOpen]);

  useEffect(() => {
    if (f.projectId && projects.length) {
      const p = projects.find(p => p.id === f.projectId);
      if (p && p.projectName !== f.projectName) setF(prev => ({ ...prev, projectName: p.projectName }));
    }
  }, [f.projectId, projects]);

  if (!isOpen) return null;
  const v = (k: string) => f[k] ?? '';
  const s = (k: string, val: any) => { setF(p => ({ ...p, [k]: val })); if (errors[k]) setErrors(p => ({ ...p, [k]: '' })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!v('projectId')) errs.projectId = 'Project is required';
    if (!v('name').trim()) errs.name = 'Milestone name is required';
    if (v('category') === 'sales' && (!v('amount') || v('amount') <= 0)) errs.amount = 'Amount required for sales milestones';
    if (!v('dueDate')) errs.dueDate = 'Due date is required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setIsSubmitting(true);
    try {
      await onSave({
        projectId: v('projectId'), projectName: v('projectName'), name: v('name'), type: v('type'), category: v('category') as MilestoneCategory, amount: parseFloat(v('amount')) || 0, dueDate: new Date(v('dueDate')), invoiceNumber: v('invoiceNumber') || undefined, paymentStatus: v('paymentStatus'), paymentReceivedDate: v('paymentReceivedDate') ? new Date(v('paymentReceivedDate')) : undefined, notes: v('notes') || undefined
      });
    } finally { setIsSubmitting(false); }
  };

  const types = ['Advance', 'Demo-1', 'Demo-2', 'Demo-3', 'UAT', 'Go Live', 'Maintenance Renewal'];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', milestone ? 'bg-blue-100' : 'bg-green-100')}><Wallet className={cn('w-5 h-5', milestone ? 'text-blue-600' : 'text-green-600')} /></div>
            <h3 className="text-lg font-bold text-gray-900">{milestone ? 'Edit Milestone' : 'Add Milestone'}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selector */}
          <section className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Tag className="w-5 h-5 text-indigo-600" /> Milestone Category</h4>
            <div className="grid grid-cols-2 gap-3">
              <label className={cn('flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition', v('category') === 'sales' ? 'bg-green-50 border-green-400' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                <input type="radio" name="category" value="sales" checked={v('category') === 'sales'} onChange={() => s('category', 'sales')} className="w-4 h-4 text-green-600" />
                <div><p className="font-medium text-sm">💰 Sales Milestone</p><p className="text-xs text-gray-500">Payment collections from client</p></div>
              </label>
              <label className={cn('flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition', v('category') === 'operational' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                <input type="radio" name="category" value="operational" checked={v('category') === 'operational'} onChange={() => s('category', 'operational')} className="w-4 h-4 text-blue-600" />
                <div><p className="font-medium text-sm">🎯 Operational Milestone</p><p className="text-xs text-gray-500">Delivery, demo, UAT, go-live</p></div>
              </label>
            </div>
          </section>

          {/* Project & Details */}
          <section className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><FolderKanban className="w-5 h-5 text-blue-600" /> Project & Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project <span className="text-red-500">*</span></label>
                <select value={v('projectId')} onChange={e => s('projectId', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500', errors.projectId && 'border-red-500')}>
                  <option value="">-- Select Project --</option>
                  {projects.filter(p => p.status === 'Active' || p.status === 'On Hold').map(p => <option key={p.id} value={p.id}>{p.projectNumber} — {p.projectName}</option>)}
                </select>
                {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Type</label>
                <select value={v('type')} onChange={e => s('type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  {types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Name <span className="text-red-500">*</span></label>
                <input type="text" value={v('name')} onChange={e => s('name', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500', errors.name && 'border-red-500')} placeholder="e.g. Demo-1 Payment, UAT Sign-off" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>
            </div>
          </section>

          {/* Payment (for sales) */}
          <section className={cn('p-4 rounded-xl border', v('category') === 'sales' ? 'bg-green-50/60 border-green-100' : 'bg-gray-50 border-gray-200')}>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><DollarSign className="w-5 h-5 text-green-600" /> Payment & Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) {v('category') === 'sales' && <span className="text-red-500">*</span>}</label>
                <input type="number" min="0" value={v('amount')} onChange={e => s('amount', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500', errors.amount && 'border-red-500')} placeholder="0" />
                {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                <input type="date" value={v('dueDate')} onChange={e => s('dueDate', e.target.value)} className={cn('w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500', errors.dueDate && 'border-red-500')} />
                {errors.dueDate && <p className="mt-1 text-xs text-red-600">{errors.dueDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select value={v('paymentStatus')} onChange={e => s('paymentStatus', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                  <option value="Pending">⏳ Pending</option><option value="Partial">🟡 Partial</option><option value="Received">✅ Received</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input type="text" value={v('invoiceNumber')} onChange={e => s('invoiceNumber', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="INV-001" />
              </div>
              {v('paymentStatus') === 'Received' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Received Date</label>
                  <input type="date" value={v('paymentReceivedDate')} onChange={e => s('paymentReceivedDate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              )}
              <div className={v('paymentStatus') === 'Received' ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={v('notes')} onChange={e => s('notes', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Additional details..." />
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={cn('flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm shadow', isSubmitting && 'opacity-50 cursor-not-allowed')}>
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {milestone ? 'Update' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
