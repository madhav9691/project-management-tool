// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PERMISSIONS & ACCESS CONTROL UTILITIES
// ==========================================

import type { User, Project, Task } from '../types';

// Check if user can view/edit/delete projects
export const canManageProjects = (user: User | null): boolean => {
  if (!user) return false;
  return ['super_admin', 'management', 'project_manager'].includes(user.role);
};

export const canViewProjects = (user: User | null): boolean => {
  if (!user) return false;
  return true; // All authenticated users can view projects
};

// Check if user is assigned to a specific project
export const isUserAssignedToProject = (user: User | null, project: Project): boolean => {
  if (!user) return false;
  
  // Super admin and management can see all projects
  if (['super_admin', 'management'].includes(user.role)) {
    return true;
  }
  
  // Check if user is the project manager
  if (user.name === project.projectManager) {
    return true;
  }
  
  // Check if user is in assigned team members
  if (project.assignedTeamMembers.includes(user.name)) {
    return true;
  }
  
  // Check if user is a primary resource
  if (project.primaryResources.includes(user.name)) {
    return true;
  }
  
  // Sales coordinators can see all projects
  if (user.role === 'sales_coordinator') {
    return true;
  }
  
  return false;
};

// Check if user can view a specific task
export const isUserAssignedToTask = (user: User | null, task: Task): boolean => {
  if (!user) return false;
  
  // Super admin and management can see all tasks
  if (['super_admin', 'management'].includes(user.role)) {
    return true;
  }
  
  // Project managers can see all tasks in their projects
  if (user.role === 'project_manager') {
    return true;
  }
  
  // Team leads can see all tasks
  if (user.role === 'team_lead') {
    return true;
  }
  
  // Check if user is the assignee
  if (task.assignedTo === user.name) {
    return true;
  }
  
  // QA can see tasks in QA status
  if (user.role === 'qa' && task.status === 'QA') {
    return true;
  }
  
  return false;
};

// Filter projects based on user assignments
export const filterProjectsByUser = (user: User | null, projects: Project[]): Project[] => {
  if (!user) return [];
  
  // Super admin and management see all projects
  if (['super_admin', 'management'].includes(user.role)) {
    return projects;
  }
  
  // Sales coordinators see all projects
  if (user.role === 'sales_coordinator') {
    return projects;
  }
  
  // Project managers see all projects
  if (user.role === 'project_manager') {
    return projects;
  }
  
  // Team leads see all projects
  if (user.role === 'team_lead') {
    return projects;
  }
  
  // Developers, QA, and other roles only see assigned projects
  return projects.filter(project => isUserAssignedToProject(user, project));
};

// Filter tasks based on user assignments
export const filterTasksByUser = (user: User | null, tasks: Task[]): Task[] => {
  if (!user) return [];
  
  // Super admin and management see all tasks
  if (['super_admin', 'management'].includes(user.role)) {
    return tasks;
  }
  
  // Project managers see all tasks
  if (user.role === 'project_manager') {
    return tasks;
  }
  
  // Team leads see all tasks
  if (user.role === 'team_lead') {
    return tasks;
  }
  
  // Developers, QA, and other roles only see assigned tasks
  return tasks.filter(task => isUserAssignedToTask(user, task));
};

// Get user's assigned projects count
export const getUserAssignedProjectsCount = (user: User | null, projects: Project[]): number => {
  return filterProjectsByUser(user, projects).length;
};

// Get user's assigned tasks count
export const getUserAssignedTasksCount = (user: User | null, tasks: Task[]): number => {
  return filterTasksByUser(user, tasks).length;
};

// Get user's pending tasks count
export const getUserPendingTasksCount = (user: User | null, tasks: Task[]): number => {
  const filteredTasks = filterTasksByUser(user, tasks);
  return filteredTasks.filter(t => t.status !== 'Completed').length;
};

// Get projects where user is primary resource
export const getUserPrimaryProjects = (user: User | null, projects: Project[]): Project[] => {
  if (!user) return [];
  return projects.filter(project => project.primaryResources.includes(user.name));
};

// Get projects where user is team member
export const getUserTeamProjects = (user: User | null, projects: Project[]): Project[] => {
  if (!user) return [];
  return projects.filter(project => project.assignedTeamMembers.includes(user.name));
};

// Get tasks assigned to user
export const getUserAssignedTasks = (user: User | null, tasks: Task[]): Task[] => {
  if (!user) return [];
  return tasks.filter(task => task.assignedTo === user.name);
};

// Get tasks assigned to user that are pending
export const getUserPendingTasks = (user: User | null, tasks: Task[]): Task[] => {
  if (!user) return [];
  const assignedTasks = getUserAssignedTasks(user, tasks);
  return assignedTasks.filter(t => t.status !== 'Completed');
};
