// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// MAINTENANCE PROJECT FORM COMPONENT
// ==========================================

import React, { useState, useEffect } from 'react';
import type { MaintenanceProject, BillingCycle } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatters';
import { mockUsers } from '../../data/mockData';

import {
  X,
  Save,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  Server,
  HardDrive,
  Database,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users
} from 'lucide-react';

interface MaintenanceFormProps {
  project?: MaintenanceProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<MaintenanceProject>) => void;
}

const initialProject: Partial<MaintenanceProject> = {
  projectNumber: '',
  projectName: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  billingCycle: '12 Months',
  maintenanceStartDate: new Date(),
  renewalDate: new Date(),
  sslExpiryDate: undefined,
  hostingExpiryDate: undefined,
  domainExpiryDate: undefined,
  lastBackupDate: undefined,
  assignedResources: [],
  weeklyHours: {},
  monthlyHours: {},
  issuesWorked: 0,
  updatesDone: 0,
  changeRequests: 0,
  ticketReferences: [],
  status: 'Active'
};

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({ 
  project, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<MaintenanceProject>>(initialProject);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [ticketRefs, setTicketRefs] = useState<string>('');

  useEffect(() => {
    if (project) {
      setFormData({ ...project });
      setSelectedResources(project.assignedResources || []);
      setTicketRefs(project.ticketReferences?.join(', ') || '');
    } else {
      setFormData({
        ...initialProject,
        projectNumber: generateProjectNumber(),
        maintenanceStartDate: new Date(),
        renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      });
      setSelectedResources([]);
      setTicketRefs('');
    }
  }, [project, isOpen]);

  const generateProjectNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `MAINT-${year}-${random}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName?.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.clientName?.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.clientEmail?.trim()) {
      newErrors.clientEmail = 'Client email is required';
    }
    if (!formData.renewalDate) {
      newErrors.renewalDate = 'Renewal date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        assignedResources: selectedResources,
        ticketReferences: ticketRefs.split(',').map(r => r.trim()).filter(Boolean)
      });
      onClose();
    } catch (error) {
      console.error('Error saving maintenance project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleResource = (resource: string) => {
    setSelectedResources(prev => 
      prev.includes(resource) 
        ? prev.filter(r => r !== resource)
        : [...prev, resource]
    );
  };

  if (!isOpen) return null;

  const billingCycles: BillingCycle[] = ['3 Months', '6 Months', '12 Months'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const allResources = mockUsers.filter(u => ['developer', 'qa', 'team_lead'].includes(u.role) && u.isActive);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto my-8">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {project ? 'Edit Maintenance Project' : 'Add Maintenance Project'}
                </h3>
                <p className="text-sm text-gray-500">{formData.projectNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Number
                    </label>
                    <input
                      type="text"
                      value={formData.projectNumber}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.projectName}
                      onChange={(e) => handleChange('projectName', e.target.value)}
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                        errors.projectName && 'border-red-500'
                      )}
                      placeholder="Enter project name"
                    />
                    {errors.projectName && (
                      <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Cycle
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => handleChange('billingCycle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {billingCycles.map(cycle => (
                        <option key={cycle} value={cycle}>{cycle}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending Renewal">Pending Renewal</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => handleChange('clientName', e.target.value)}
                        className={cn(
                          'w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                          errors.clientName && 'border-red-500'
                        )}
                        placeholder="Client contact person"
                      />
                    </div>
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => handleChange('clientEmail', e.target.value)}
                        className={cn(
                          'w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                          errors.clientEmail && 'border-red-500'
                        )}
                        placeholder="client@email.com"
                      />
                    </div>
                    {errors.clientEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => handleChange('clientPhone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Important Dates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.maintenanceStartDate ? formatDate(formData.maintenanceStartDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('maintenanceStartDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Renewal Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.renewalDate ? formatDate(formData.renewalDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('renewalDate', new Date(e.target.value))}
                        className={cn(
                          'w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                          errors.renewalDate && 'border-red-500'
                        )}
                      />
                    </div>
                    {errors.renewalDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.renewalDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Backup Date
                    </label>
                    <div className="relative">
                      <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.lastBackupDate ? formatDate(formData.lastBackupDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('lastBackupDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SSL Expiry Date
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.sslExpiryDate ? formatDate(formData.sslExpiryDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('sslExpiryDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hosting Expiry Date
                    </label>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.hostingExpiryDate ? formatDate(formData.hostingExpiryDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('hostingExpiryDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Domain Expiry Date
                    </label>
                    <div className="relative">
                      <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.domainExpiryDate ? formatDate(formData.domainExpiryDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('domainExpiryDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Resources */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Assigned Resources
                </h4>
                <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {allResources.map(resource => (
                      <label key={resource.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource.name)}
                          onChange={() => toggleResource(resource.name)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{resource.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Selected: {selectedResources.length} resources</p>
              </div>

              {/* Working Hours */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Working Hours Tracking
                </h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    This Week Working Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.weeklyHours?.['Current'] || 0}
                      onChange={(e) => handleChange('weeklyHours', { ...formData.weeklyHours, 'Current': parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Working Hours (Jan-Dec)
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {months.map(month => (
                      <div key={month}>
                        <label className="block text-xs text-gray-500 mb-1">{month}</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={formData.monthlyHours?.[month] || 0}
                          onChange={(e) => handleChange('monthlyHours', { ...formData.monthlyHours, [month]: parseFloat(e.target.value) || 0 })}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Maintenance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issues Worked
                    </label>
                    <div className="relative">
                      <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={formData.issuesWorked || 0}
                        onChange={(e) => handleChange('issuesWorked', parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Updates Done
                    </label>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={formData.updatesDone || 0}
                        onChange={(e) => handleChange('updatesDone', parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Change Requests
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={formData.changeRequests || 0}
                        onChange={(e) => handleChange('changeRequests', parseInt(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ticket References
                    </label>
                    <input
                      type="text"
                      value={ticketRefs}
                      onChange={(e) => setTicketRefs(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="TKT-001, TKT-002"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {project ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
