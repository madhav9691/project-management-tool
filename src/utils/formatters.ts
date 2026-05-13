// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// FORMATTING UTILITIES
// ==========================================

import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns';

export const formatDate = (date: Date | string | undefined, pattern: string = 'MMM dd, yyyy'): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, pattern);
};

export const formatDateTime = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM dd, yyyy HH:mm');
};

export const formatRelative = (date: Date | string | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isTomorrow(d)) return 'Tomorrow';
  
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

export const formatDuration = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${Math.round(hours * 10) / 10} hrs`;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Open': 'bg-gray-100 text-gray-800',
    'QA': 'bg-purple-100 text-purple-800',
    'Reopened': 'bg-red-100 text-red-800',
    'Received': 'bg-green-100 text-green-800',
    'Critical': 'bg-red-100 text-red-800',
    'High': 'bg-orange-100 text-orange-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-green-100 text-green-800',
    'Expired': 'bg-red-100 text-red-800',
    'Live': 'bg-green-100 text-green-800',
    'UAT': 'bg-purple-100 text-purple-800',
    'Development': 'bg-blue-100 text-blue-800',
    'UI': 'bg-pink-100 text-pink-800',
    'Mitigated': 'bg-green-100 text-green-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    'Critical': 'text-red-600 bg-red-50 border-red-200',
    'High': 'text-orange-600 bg-orange-50 border-orange-200',
    'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'Low': 'text-green-600 bg-green-50 border-green-200'
  };
  return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
};

export const getOccupancyColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const getOccupancyStatus = (percentage: number): { color: string; label: string } => {
  if (percentage >= 90) return { color: 'bg-red-500', label: 'Fully Occupied' };
  if (percentage >= 70) return { color: 'bg-yellow-500', label: 'Partially Busy' };
  return { color: 'bg-green-500', label: 'Available' };
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const generateProjectId = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `KRY-${year}-${random}`;
};

export const generateTaskId = (): string => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TASK-${random}`;
};

export const getDaysLeft = (date: Date | string): number => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isOverdue = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

export const getWeekNumber = (date: Date = new Date()): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month];
};

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
};

export const groupBy = <T,>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    result[groupKey] = result[groupKey] || [];
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortByDate = <T extends { [key: string]: any }>(
  array: T[], 
  key: keyof T, 
  order: 'asc' | 'desc' = 'desc'
): T[] => {
  return [...array].sort((a, b) => {
    const aDate = new Date(a[key]).getTime();
    const bDate = new Date(b[key]).getTime();
    return order === 'asc' ? aDate - bDate : bDate - aDate;
  });
};
