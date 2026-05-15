// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// API SERVICE LAYER
// ==========================================
//
// This is the SINGLE source of truth for all data operations.
// Currently uses localStorage as a temporary database.
//
// TO CONNECT TO REAL DATABASE:
// Replace the body of each function with a fetch() call to your backend API.
// Example:
//   const res = await fetch('https://api.krify.com/projects', { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
//   return res.json();
//
// The rest of the application does NOT need to change — only this file.
// ==========================================

import type { Project, Task, Resource, Milestone, WeeklyMeeting, Notification, User } from '../types';

// ─── Storage Keys (temporary until backend is connected) ───
const KEYS = {
  PROJECTS: 'krify_db_projects',
  TASKS: 'krify_db_tasks',
  RESOURCES: 'krify_db_resources',
  MILESTONES: 'krify_db_milestones',
  MEETINGS: 'krify_db_meetings',
  NOTIFICATIONS: 'krify_db_notifications',
  USERS: 'krify_db_users',
  USER_SESSION: 'krify_db_session',
};

// ─── Generic helpers ───
function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ═══════════════════════════════════════════
// PROJECTS API
// Backend: GET/POST/PUT/DELETE /api/projects
// ═══════════════════════════════════════════

export const ProjectsAPI = {
  async getAll(): Promise<Project[]> {
    // TODO: return (await fetch('/api/projects')).json();
    return read<Project>(KEYS.PROJECTS);
  },
  async getById(id: string): Promise<Project | undefined> {
    const all = await this.getAll();
    return all.find(p => p.id === id);
  },
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const all = await this.getAll();
    const newProject: Project = { ...project, id: `proj-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() } as Project;
    write(KEYS.PROJECTS, [...all, newProject]);
    return newProject;
  },
  async update(id: string, data: Partial<Project>): Promise<Project> {
    const all = await this.getAll();
    const updated = all.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p);
    write(KEYS.PROJECTS, updated);
    return updated.find(p => p.id === id)!;
  },
  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.PROJECTS, all.filter(p => p.id !== id));
  },
  async initialize(defaults: Project[]): Promise<void> {
    const existing = await this.getAll();
    if (existing.length === 0) write(KEYS.PROJECTS, defaults);
  }
};

// ═══════════════════════════════════════════
// TASKS API
// Backend: GET/POST/PUT/DELETE /api/tasks
// ═══════════════════════════════════════════

export const TasksAPI = {
  async getAll(): Promise<Task[]> {
    return read<Task>(KEYS.TASKS);
  },
  async getByProject(projectId: string): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter(t => t.projectId === projectId);
  },
  async getByUser(userName: string): Promise<Task[]> {
    const all = await this.getAll();
    return all.filter(t => t.assignedTo === userName);
  },
  async create(task: Partial<Task>): Promise<Task> {
    const all = await this.getAll();
    const newTask: Task = { ...task, id: `task-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), comments: [], attachments: [] } as Task;
    write(KEYS.TASKS, [...all, newTask]);
    return newTask;
  },
  async update(id: string, data: Partial<Task>): Promise<Task> {
    const all = await this.getAll();
    const updated = all.map(t => t.id === id ? { ...t, ...data, updatedAt: new Date() } : t);
    write(KEYS.TASKS, updated);
    return updated.find(t => t.id === id)!;
  },
  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.TASKS, all.filter(t => t.id !== id));
  },
  async initialize(defaults: Task[]): Promise<void> {
    const existing = await this.getAll();
    if (existing.length === 0) write(KEYS.TASKS, defaults);
  }
};

// ═══════════════════════════════════════════
// RESOURCES API
// Backend: GET/POST/PUT/DELETE /api/resources
// ═══════════════════════════════════════════

export const ResourcesAPI = {
  async getAll(): Promise<Resource[]> {
    return read<Resource>(KEYS.RESOURCES);
  },
  async create(resource: Partial<Resource>): Promise<Resource> {
    const all = await this.getAll();
    const newRes: Resource = { ...resource, id: `res-${Date.now()}`, joinDate: new Date(), allocations: [], currentProjects: [] } as Resource;
    write(KEYS.RESOURCES, [...all, newRes]);
    return newRes;
  },
  async update(id: string, data: Partial<Resource>): Promise<Resource> {
    const all = await this.getAll();
    const updated = all.map(r => r.id === id ? { ...r, ...data } : r);
    write(KEYS.RESOURCES, updated);
    return updated.find(r => r.id === id)!;
  },
  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.RESOURCES, all.filter(r => r.id !== id));
  },
  async initialize(defaults: Resource[]): Promise<void> {
    const existing = await this.getAll();
    if (existing.length === 0) write(KEYS.RESOURCES, defaults);
  }
};

// ═══════════════════════════════════════════
// MILESTONES API
// Backend: GET/POST/PUT/DELETE /api/milestones
// ═══════════════════════════════════════════

export const MilestonesAPI = {
  async getAll(): Promise<Milestone[]> {
    return read<Milestone>(KEYS.MILESTONES);
  },
  async create(milestone: Partial<Milestone>): Promise<Milestone> {
    const all = await this.getAll();
    const newMil: Milestone = { ...milestone, id: `mil-${Date.now()}` } as Milestone;
    write(KEYS.MILESTONES, [...all, newMil]);
    return newMil;
  },
  async update(id: string, data: Partial<Milestone>): Promise<Milestone> {
    const all = await this.getAll();
    const updated = all.map(m => m.id === id ? { ...m, ...data } : m);
    write(KEYS.MILESTONES, updated);
    return updated.find(m => m.id === id)!;
  },
  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.MILESTONES, all.filter(m => m.id !== id));
  },
  async initialize(defaults: Milestone[]): Promise<void> {
    const existing = await this.getAll();
    if (existing.length === 0) write(KEYS.MILESTONES, defaults);
  }
};

// ═══════════════════════════════════════════
// MEETINGS API
// Backend: GET/POST/PUT/DELETE /api/meetings
// ═══════════════════════════════════════════

export const MeetingsAPI = {
  async getAll(): Promise<WeeklyMeeting[]> {
    return read<WeeklyMeeting>(KEYS.MEETINGS);
  },
  async create(meeting: Partial<WeeklyMeeting>): Promise<WeeklyMeeting> {
    const all = await this.getAll();
    const newMeeting = { ...meeting, id: `wm-${Date.now()}`, createdAt: new Date() } as WeeklyMeeting;
    write(KEYS.MEETINGS, [newMeeting, ...all]);
    return newMeeting;
  },
  async update(id: string, data: Partial<WeeklyMeeting>): Promise<void> {
    const all = await this.getAll();
    write(KEYS.MEETINGS, all.map(m => m.id === id ? { ...m, ...data } : m));
  },
  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.MEETINGS, all.filter(m => m.id !== id));
  },
  async initialize(defaults: WeeklyMeeting[]): Promise<void> {
    const existing = await this.getAll();
    if (existing.length === 0) write(KEYS.MEETINGS, defaults);
  }
};

// ═══════════════════════════════════════════
// NOTIFICATIONS API
// Backend: GET/POST/PUT/DELETE /api/notifications
// ═══════════════════════════════════════════

export const NotificationsAPI = {
  async getAll(): Promise<Notification[]> {
    return read<Notification>(KEYS.NOTIFICATIONS);
  },
  async getForUser(userName: string, userRole: string): Promise<Notification[]> {
    const all = await this.getAll();
    return all.filter(n => {
      if (n.forUser && n.forUser === userName) return true;
      if (n.forRole && n.forRole.includes(userRole as any)) return true;
      if (!n.forUser && !n.forRole) return true;
      return false;
    });
  },
  async create(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<void> {
    const all = await this.getAll();
    all.unshift({ ...notification, id: `notif-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, isRead: false, createdAt: new Date() });
    write(KEYS.NOTIFICATIONS, all.slice(0, 500));
  },
  async markRead(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.NOTIFICATIONS, all.map(n => n.id === id ? { ...n, isRead: true } : n));
  },
  async markAllRead(userName: string, userRole: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.NOTIFICATIONS, all.map(n => {
      const isForUser = (n.forUser === userName) || (n.forRole && n.forRole.includes(userRole as any)) || (!n.forUser && !n.forRole);
      return isForUser ? { ...n, isRead: true } : n;
    }));
  },
  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.NOTIFICATIONS, all.filter(n => n.id !== id));
  },
  async clearForUser(userName: string, userRole: string): Promise<void> {
    const all = await this.getAll();
    write(KEYS.NOTIFICATIONS, all.filter(n => {
      const isForUser = (n.forUser === userName) || (n.forRole && n.forRole.includes(userRole as any)) || (!n.forUser && !n.forRole);
      return !isForUser;
    }));
  }
};

// ═══════════════════════════════════════════
// AUTH API
// Backend: POST /api/auth/login, /api/auth/logout
// ═══════════════════════════════════════════

export const AuthAPI = {
  async login(email: string, password: string, allUsers: User[]): Promise<User | null> {
    // TODO: const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    const user = allUsers.find(u => u.email === email);
    if (user && password === 'password') {
      localStorage.setItem(KEYS.USER_SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  },
  async logout(): Promise<void> {
    localStorage.removeItem(KEYS.USER_SESSION);
  },
  async getSession(): Promise<User | null> {
    try { return JSON.parse(localStorage.getItem(KEYS.USER_SESSION) || 'null'); } catch { return null; }
  }
};

// ═══════════════════════════════════════════
// DATA MANAGEMENT
// ═══════════════════════════════════════════

export const DataAPI = {
  async exportAll() {
    return {
      projects: await ProjectsAPI.getAll(),
      tasks: await TasksAPI.getAll(),
      resources: await ResourcesAPI.getAll(),
      milestones: await MilestonesAPI.getAll(),
      meetings: await MeetingsAPI.getAll(),
      notifications: await NotificationsAPI.getAll(),
      exportedAt: new Date().toISOString()
    };
  },
  async clearModule(module: 'projects' | 'tasks' | 'resources' | 'milestones' | 'meetings' | 'notifications') {
    const keyMap: Record<string, string> = {
      projects: KEYS.PROJECTS, tasks: KEYS.TASKS, resources: KEYS.RESOURCES,
      milestones: KEYS.MILESTONES, meetings: KEYS.MEETINGS, notifications: KEYS.NOTIFICATIONS
    };
    localStorage.removeItem(keyMap[module]);
  },
  async clearAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
  async getStats() {
    const projects = await ProjectsAPI.getAll();
    const tasks = await TasksAPI.getAll();
    const resources = await ResourcesAPI.getAll();
    const milestones = await MilestonesAPI.getAll();
    const notifications = await NotificationsAPI.getAll();
    return {
      projects: projects.length,
      tasks: tasks.length,
      resources: resources.length,
      milestones: milestones.length,
      notifications: notifications.length,
      storageUsed: Object.values(KEYS).reduce((a, k) => a + (localStorage.getItem(k) || '').length, 0)
    };
  }
};
