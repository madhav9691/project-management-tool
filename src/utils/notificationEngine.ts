// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// DYNAMIC NOTIFICATION ENGINE
// Fires notifications on every CRUD action
// ==========================================

import type { Notification, UserRole } from '../types';
import { getNotificationsFromStorage, saveNotificationsToStorage } from './storage';

const makeId = () => `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function push(n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
  const all = getNotificationsFromStorage();
  all.unshift({ ...n, id: makeId(), isRead: false, createdAt: new Date() });
  saveNotificationsToStorage(all.slice(0, 300));
}

// ─── PROJECT NOTIFICATIONS ───

export function notifyProjectCreated(projectName: string, projectNumber: string, teamMembers: string[]) {
  // PM / Management
  push({ title: '🆕 New Project Created', message: `"${projectName}" (${projectNumber}) has been created`, type: 'success', link: '/projects', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[] });
  // Each team member
  teamMembers.forEach(member => {
    push({ title: '🆕 You\'ve Been Assigned to a Project', message: `You are now part of "${projectName}" (${projectNumber})`, type: 'info', link: '/projects', forUser: member, projectName });
  });
}

export function notifyProjectUpdated(projectName: string, updatedBy: string) {
  push({ title: '📝 Project Updated', message: `"${projectName}" was updated by ${updatedBy}`, type: 'info', link: '/projects', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[], projectName });
}

export function notifyProjectDeleted(projectName: string, deletedBy: string) {
  push({ title: '🗑️ Project Deleted', message: `"${projectName}" was deleted by ${deletedBy}`, type: 'warning', link: '/projects', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[] });
}

// ─── TASK NOTIFICATIONS ───

export function notifyTaskCreated(taskTitle: string, taskId: string, projectName: string, assignedTo: string, assignedBy: string) {
  // For the resource
  push({ title: '📝 New Task Assigned', message: `"${taskTitle}" assigned to you by ${assignedBy} for ${projectName}`, type: 'success', link: '/tasks', forUser: assignedTo, taskId, projectName });
  // For PM
  push({ title: '📝 Task Created', message: `"${taskTitle}" (${taskId}) assigned to ${assignedTo} for ${projectName}`, type: 'info', link: '/tasks', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[], taskId, projectName });
}

export function notifyTaskStatusChanged(taskTitle: string, taskId: string, projectName: string, assignedTo: string, oldStatus: string, newStatus: string) {
  // For PM — resource changed status
  push({ title: `📊 Task Status: ${newStatus}`, message: `${assignedTo} changed "${taskTitle}" from ${oldStatus} → ${newStatus}`, type: newStatus === 'Completed' ? 'success' : 'info', link: '/tasks', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[], taskId, projectName });
  // If moved to QA, notify QA team
  if (newStatus === 'QA') {
    push({ title: '🟣 Task Ready for QA', message: `"${taskTitle}" moved to QA by ${assignedTo}`, type: 'info', link: '/tasks', forRole: ['qa'] as UserRole[], taskId, projectName });
  }
}

export function notifyTaskOverdue(taskTitle: string, taskId: string, assignedTo: string, projectName: string) {
  push({ title: '⏰ Task Overdue', message: `"${taskTitle}" assigned to ${assignedTo} is past due date`, type: 'error', link: '/tasks', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[], taskId, projectName });
  push({ title: '⏰ Your Task is Overdue', message: `"${taskTitle}" is past due. Please update status or request extension.`, type: 'error', link: '/tasks', forUser: assignedTo, taskId, projectName });
}

export function notifyTaskDeleted(taskTitle: string, deletedBy: string, assignedTo: string) {
  push({ title: '🗑️ Task Removed', message: `"${taskTitle}" has been removed by ${deletedBy}`, type: 'warning', link: '/tasks', forUser: assignedTo });
  push({ title: '🗑️ Task Deleted', message: `"${taskTitle}" (assigned to ${assignedTo}) was deleted by ${deletedBy}`, type: 'warning', link: '/tasks', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[] });
}

// ─── MILESTONE NOTIFICATIONS ───

export function notifyMilestoneCreated(milestoneName: string, projectName: string, amount: number) {
  push({ title: '💰 Milestone Added', message: `"${milestoneName}" for ${projectName}${amount > 0 ? ` — $${amount.toLocaleString()}` : ''}`, type: 'info', link: '/milestones', forRole: ['super_admin', 'management', 'project_manager', 'sales_coordinator'] as UserRole[], projectName });
}

export function notifyPaymentReceived(milestoneName: string, projectName: string, amount: number) {
  push({ title: '✅ Payment Received', message: `$${amount.toLocaleString()} received for "${milestoneName}" — ${projectName}`, type: 'success', link: '/milestones', forRole: ['super_admin', 'management', 'project_manager', 'sales_coordinator'] as UserRole[], projectName });
}

// ─── RESOURCE NOTIFICATIONS ───

export function notifyResourceAdded(resourceName: string) {
  push({ title: '👤 New Resource Added', message: `${resourceName} has been added to the team`, type: 'success', link: '/resources', forRole: ['super_admin', 'management', 'project_manager'] as UserRole[] });
}

// ─── GENERIC ───

export function notifyGeneral(title: string, message: string, type: Notification['type'], forRole?: UserRole[], forUser?: string) {
  push({ title, message, type, forRole, forUser });
}
