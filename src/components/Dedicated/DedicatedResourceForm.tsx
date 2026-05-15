// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// DEDICATED RESOURCE FORM COMPONENT
// ==========================================

import React, { useState, useEffect } from 'react';
import type { ResourceAllocation } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatters';
import { mockUsers, mockProjects } from '../../data/mockData';

import {
  X,
  Save,
  User,
  Building2,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

interface DedicatedResourceFormProps {
  allocation?: ResourceAllocation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (allocation: Partial<ResourceAllocation>) => void;
}

const initialAllocation: Partial<ResourceAllocation> = {
  resourceId: '',
  resourceName: '',
  projectId: '',
  projectName: '',
  allocationPercentage: 100,
  startDate: new Date(),
  endDate: undefined,
  billingRate: 0,
  isDedicated: true
};

export const DedicatedResourceForm: React.FC<DedicatedResourceFormProps> = ({ 
  allocation, 
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<ResourceAllocation>>(initialAllocation);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (allocation) {
      setFormData({ ...allocation });
    } else {
      setFormData({
        ...initialAllocation,
        startDate: new Date()
      });
    }
  }, [allocation, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.resourceId) {
      newErrors.resourceId = 'Resource is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.allocationPercentage || formData.allocationPercentage < 0 || formData.allocationPercentage > 100) {
      newErrors.allocationPercentage = 'Allocation must be between 0 and 100';
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
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving allocation:', error);
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

  // Update resource name when resource changes
  useEffect(() => {
    if (formData.resourceId) {
      const resource = mockUsers.find(u => u.id === formData.resourceId);
      if (resource) {
        setFormData(prev => ({ ...prev, resourceName: resource.name }));
      }
    }
  }, [formData.resourceId]);

  // Update project name when project changes
  useEffect(() => {
    if (formData.projectId) {
      const project = mockProjects.find(p => p.id === formData.projectId);
      if (project) {
        setFormData(prev => ({ ...prev, projectName: project.projectName }));
      }
    }
  }, [formData.projectId]);

  if (!isOpen) return null;

  // Get available resources (developers, QA, team leads)
  const availableResources = mockUsers.filter(u => 
    ['developer', 'qa', 'team_lead'].includes(u.role) && u.isActive
  );

  // Get active projects
  const activeProjects = mockProjects.filter(p => p.status === 'Active');

  // Calculate occupancy based on allocation
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="min-h-screen px-4 py-8 flex items-start justify-center">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto my-8">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {allocation ? 'Edit Resource Allocation' : 'Assign Dedicated Resource'}
                </h3>
                <p className="text-sm text-gray-500">Dedicated Resource Management</p>
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
              {/* Resource Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Resource Details
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Resource <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.resourceId}
                      onChange={(e) => handleChange('resourceId', e.target.value)}
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500',
                        errors.resourceId && 'border-red-500'
                      )}
                    >
                      <option value="">Select a resource</option>
                      {availableResources.map(resource => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name} - {resource.department}
                        </option>
                      ))}
                    </select>
                    {errors.resourceId && (
                      <p className="mt-1 text-sm text-red-600">{errors.resourceId}</p>
                    )}
                  </div>

                  {formData.resourceName && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-medium">
                        {formData.resourceName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formData.resourceName}</p>
                        <p className="text-sm text-gray-500">
                          {mockUsers.find(u => u.name === formData.resourceName)?.department}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Selection */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Project Assignment
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Project <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => handleChange('projectId', e.target.value)}
                      className={cn(
                        'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500',
                        errors.projectId && 'border-red-500'
                      )}
                    >
                      <option value="">Select a project</option>
                      {activeProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.projectNumber} - {project.projectName}
                        </option>
                      ))}
                    </select>
                    {errors.projectId && (
                      <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
                    )}
                  </div>

                  {formData.projectName && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{formData.projectName}</p>
                        <p className="text-sm text-gray-500">{formData.projectId}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Allocation Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Allocation Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allocation Percentage <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.allocationPercentage}
                        onChange={(e) => handleChange('allocationPercentage', parseInt(e.target.value) || 0)}
                        className={cn(
                          'w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500',
                          errors.allocationPercentage && 'border-red-500'
                        )}
                      />
                    </div>
                    {errors.allocationPercentage && (
                      <p className="mt-1 text-sm text-red-600">{errors.allocationPercentage}</p>
                    )}
                    
                    {/* Visual indicator */}
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full transition-all', getOccupancyColor(formData.allocationPercentage || 0))}
                          style={{ width: `${formData.allocationPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Available</span>
                        <span>Occupied</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Billing Rate ($/hour)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.billingRate}
                        onChange={(e) => handleChange('billingRate', parseFloat(e.target.value) || 0)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.startDate ? formatDate(formData.startDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('startDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.endDate ? formatDate(formData.endDate, 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Allocation Status */}
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-900">Allocation Summary</p>
                    <div className="mt-2 space-y-1 text-sm text-purple-700">
                      <p>• Resource: {formData.resourceName || 'Not selected'}</p>
                      <p>• Project: {formData.projectName || 'Not selected'}</p>
                      <p>• Allocation: {formData.allocationPercentage}%</p>
                      {formData.billingRate && formData.billingRate > 0 && (
                        <p>• Estimated Monthly: ${((formData.billingRate || 0) * (formData.allocationPercentage || 0) * 160 / 100).toFixed(0)}</p>
                      )}
                    </div>
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
                    'flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {allocation ? 'Update Allocation' : 'Assign Resource'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
