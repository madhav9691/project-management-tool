// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// SIDEBAR NAVIGATION COMPONENT
// ==========================================

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { cn } from '../../utils/cn';

import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Wallet,
  Settings,
  Users,
  Ticket,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  LogOut,
  Building2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
  badge?: number;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['super_admin', 'management', 'project_manager', 'team_lead', 'developer', 'qa', 'sales_coordinator']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderKanban,
    path: '/projects',
    roles: ['super_admin', 'management', 'project_manager', 'team_lead', 'developer', 'qa', 'sales_coordinator'],
    children: [
      { id: 'running', label: 'Running Projects', icon: FolderKanban, path: '/projects/running', roles: ['super_admin', 'management', 'project_manager', 'team_lead', 'developer', 'qa', 'sales_coordinator'] },
      { id: 'dedicated', label: 'Dedicated Resources', icon: Users, path: '/projects/dedicated', roles: ['super_admin', 'management', 'project_manager', 'sales_coordinator'] },
      { id: 'maintenance', label: 'Maintenance', icon: Shield, path: '/projects/maintenance', roles: ['super_admin', 'management', 'project_manager'] }
    ]
  },
  {
    id: 'tasks',
    label: 'Tasks & Tickets',
    icon: Ticket,
    path: '/tasks',
    roles: ['super_admin', 'management', 'project_manager', 'team_lead', 'developer', 'qa'],
    badge: 5
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: Users,
    path: '/resources',
    roles: ['super_admin', 'management', 'project_manager', 'team_lead']
  },
  {
    id: 'weekly-meetings',
    label: 'Weekly Meetings',
    icon: CalendarDays,
    path: '/weekly-meetings',
    roles: ['super_admin', 'management', 'project_manager']
  },
  {
    id: 'milestones',
    label: 'Milestones & Payments',
    icon: Wallet,
    path: '/milestones',
    roles: ['super_admin', 'management', 'project_manager', 'sales_coordinator']
  },
  {
    id: 'risks',
    label: 'Risks & Escalations',
    icon: AlertTriangle,
    path: '/risks',
    roles: ['super_admin', 'management', 'project_manager'],
    badge: 3
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    path: '/reports',
    roles: ['super_admin', 'management', 'project_manager']
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    roles: ['super_admin', 'management', 'project_manager', 'team_lead', 'developer', 'qa'],
    badge: 5
  },
  {
    id: 'admin',
    label: 'Admin Settings',
    icon: Settings,
    path: '/admin',
    roles: ['super_admin', 'management'],
    children: [
      { id: 'users', label: 'Users', icon: Users, path: '/admin/users', roles: ['super_admin', 'management'] },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield, path: '/admin/roles', roles: ['super_admin'] },
      { id: 'settings', label: 'System Settings', icon: Settings, path: '/admin/settings', roles: ['super_admin', 'management'] }
    ]
  }
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['projects']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole([role]))
  );

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className={cn('flex items-center gap-3', !isOpen && 'justify-center w-full')}>
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-900">KRIFY</span>
              <span className="text-xs text-gray-500">Software Technologies</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors',
            !isOpen && 'hidden'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Toggle Button when collapsed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.id);

            if (hasChildren && item.children) {
              const filteredChildren = item.children.filter(child =>
                child.roles.some(role => hasRole([role]))
              );

              if (filteredChildren.length === 0) return null;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn('w-5 h-5 shrink-0', active ? 'text-blue-600' : 'text-gray-500')} />
                      {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {isOpen && (
                      isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  {isOpen && isExpanded && (
                    <ul className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
                      {filteredChildren.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <li key={child.id}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                cn(
                                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                                )
                              }
                            >
                              <ChildIcon className="w-4 h-4 shrink-0" />
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    )
                  }
                >
                  <Icon className={cn('w-5 h-5 shrink-0', 'text-gray-500')} />
                  {isOpen && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {!isOpen && item.badge && (
                    <span className="absolute top-2 right-2 w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize truncate">{user?.role.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
