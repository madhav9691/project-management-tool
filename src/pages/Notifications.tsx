import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getNotificationsFromStorage, saveNotificationsToStorage, getTasksFromStorage } from '../utils/storage';
import type { Notification } from '../types';
import { cn } from '../utils/cn';
import { formatDate } from '../utils/formatters';
import { notifyTaskOverdue } from '../utils/notificationEngine';
import { Bell, CheckCircle2, AlertCircle, Info, AlertTriangle, Trash2, Check, CheckCheck, FolderKanban, Ticket, RefreshCw } from 'lucide-react';

export const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'info' | 'warning' | 'error' | 'success'>('all');

  const load = useCallback(() => {
    setNotifications(getNotificationsFromStorage());
  }, []);

  useEffect(() => { load(); }, [load]);

  // On mount, scan for overdue tasks and fire notifications if not already fired
  useEffect(() => {
    const tasks = getTasksFromStorage();
    const existing = getNotificationsFromStorage();
    const now = new Date();
    let added = false;
    tasks.forEach(t => {
      if (t.status !== 'Completed' && new Date(t.dueDate) < now) {
        if (!existing.find(n => n.id?.includes(`overdue-${t.id}`))) {
          notifyTaskOverdue(t.title, t.taskId, t.assignedTo, t.projectName);
          added = true;
        }
      }
    });
    if (added) load();
  }, [load]);

  // Filter for current user
  const userNotifications = notifications.filter(n => {
    if (!user) return false;
    if (n.forUser && n.forUser === user.name) return true;
    if (n.forRole && n.forRole.includes(user.role)) return true;
    if (!n.forUser && !n.forRole) return true;
    return false;
  });

  const filtered = userNotifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.isRead;
    return n.type === filterType;
  });

  const persist = (u: Notification[]) => { setNotifications(u); saveNotificationsToStorage(u); };
  const markRead = (id: string) => persist(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  const markAllRead = () => persist(notifications.map(n => userNotifications.find(un => un.id === n.id) ? { ...n, isRead: true } : n));
  const deleteNotif = (id: string) => persist(notifications.filter(n => n.id !== id));
  const clearAll = () => { if (window.confirm('Clear all your notifications?')) persist(notifications.filter(n => !userNotifications.find(un => un.id === n.id))); };

  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  const typeIcon = (type: string) => {
    if (type === 'error') return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (type === 'warning') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };
  const typeBg = (type: string, read: boolean) => {
    if (read) return 'bg-white';
    if (type === 'error') return 'bg-red-50';
    if (type === 'warning') return 'bg-yellow-50';
    if (type === 'success') return 'bg-green-50';
    return 'bg-blue-50';
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
          {unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"><CheckCheck className="w-4 h-4" /> Mark All Read</button>}
          <button onClick={clearAll} className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 text-sm"><Trash2 className="w-4 h-4" /> Clear All</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { l: 'Total', v: userNotifications.length, c: 'bg-blue-500', f: 'all' as const },
          { l: 'Unread', v: unreadCount, c: 'bg-purple-500', f: 'unread' as const },
          { l: 'Alerts', v: userNotifications.filter(n => n.type === 'error').length, c: 'bg-red-500', f: 'error' as const },
          { l: 'Warnings', v: userNotifications.filter(n => n.type === 'warning').length, c: 'bg-yellow-500', f: 'warning' as const },
          { l: 'Updates', v: userNotifications.filter(n => n.type === 'success' || n.type === 'info').length, c: 'bg-green-500', f: 'info' as const },
        ].map(st => (
          <button key={st.l} onClick={() => setFilterType(st.f)} className={cn('bg-white p-4 rounded-xl border transition-colors text-left', filterType === st.f ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300')}>
            <div className="flex items-center gap-2 mb-1"><div className={`w-2.5 h-2.5 rounded-full ${st.c}`} /><span className="text-xs text-gray-500">{st.l}</span></div>
            <p className="text-xl font-bold text-gray-900">{st.v}</p>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Bell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1 text-sm">Notifications appear here when projects are created, tasks assigned, statuses changed, or deadlines pass.</p>
          </div>
        )}
        {filtered.map(n => (
          <div key={n.id} className={cn('flex items-start gap-4 p-4 rounded-xl border border-gray-200 transition-colors', typeBg(n.type, n.isRead))}>
            <div className="mt-0.5">{typeIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm', n.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold')}>{n.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span>{formatDate(n.createdAt)}</span>
                {n.projectName && <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3" />{n.projectName}</span>}
                {n.taskId && <span className="flex items-center gap-1"><Ticket className="w-3 h-3" />{n.taskId}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!n.isRead && <button onClick={() => markRead(n.id)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Mark read"><Check className="w-4 h-4" /></button>}
              <button onClick={() => deleteNotif(n.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
