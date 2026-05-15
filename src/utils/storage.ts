// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// LOCAL STORAGE PERSISTENCE UTILITIES
// ==========================================

import type { Project, Task, Resource, Milestone, WeeklyMeeting, Notification } from '../types';

// These keys MUST match src/services/api.ts so both layers share the same database
const STORAGE_KEYS = {
  PROJECTS: 'krify_db_projects',
  TASKS: 'krify_db_tasks',
  RESOURCES: 'krify_db_resources',
  MILESTONES: 'krify_db_milestones',
  MEETINGS: 'krify_db_meetings',
  NOTIFICATIONS: 'krify_db_notifications',
  USER: 'krify_db_session'
};

// Projects
export const getProjectsFromStorage = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading projects from storage:', error);
    return [];
  }
};

export const saveProjectsToStorage = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects to storage:', error);
  }
};

// Tasks
export const getTasksFromStorage = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
    return [];
  }
};

export const saveTasksToStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
};

// Resources
export const getResourcesFromStorage = (): Resource[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading resources from storage:', error);
    return [];
  }
};

export const saveResourcesToStorage = (resources: Resource[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  } catch (error) {
    console.error('Error saving resources to storage:', error);
  }
};

// Milestones
export const getMilestonesFromStorage = (): Milestone[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading milestones from storage:', error);
    return [];
  }
};

export const saveMilestonesToStorage = (milestones: Milestone[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  } catch (error) {
    console.error('Error saving milestones to storage:', error);
  }
};

// Meetings
export const getMeetingsFromStorage = (): WeeklyMeeting[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading meetings from storage:', error);
    return [];
  }
};

export const saveMeetingsToStorage = (meetings: WeeklyMeeting[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (error) {
    console.error('Error saving meetings to storage:', error);
  }
};

// Notifications
export const getNotificationsFromStorage = (): Notification[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
export const saveNotificationsToStorage = (n: Notification[]): void => {
  try { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(n)); } catch {}
};
export const addNotification = (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): void => {
  const all = getNotificationsFromStorage();
  all.unshift({ ...n, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, isRead: false, createdAt: new Date() });
  saveNotificationsToStorage(all.slice(0, 200)); // keep last 200
};

// User
export const getUserFromStorage = (): any => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading user from storage:', error);
    return null;
  }
};

export const saveUserToStorage = (user: any): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

export const clearUserFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error clearing user from storage:', error);
  }
};

// Clear all storage
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// Initialize storage with default data if empty
export const initializeStorage = (
  defaultProjects: Project[],
  defaultTasks: Task[],
  defaultResources: Resource[],
  defaultMilestones: Milestone[]
): void => {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      saveProjectsToStorage(defaultProjects);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      saveTasksToStorage(defaultTasks);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESOURCES)) {
      saveResourcesToStorage(defaultResources);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MILESTONES)) {
      saveMilestonesToStorage(defaultMilestones);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};
