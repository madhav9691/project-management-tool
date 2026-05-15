import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/formatters';
import { Bell, Search, Menu, Sun, Moon, ChevronDown, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { mockNotifications } from '../../data/mockData';

interface HeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, isDarkMode, onThemeToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadNotifications = mockNotifications.filter(n => !n.isRead);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search projects, tasks, resources..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:block text-sm text-gray-500">{formatDate(new Date(), 'EEEE, MMMM dd, yyyy')}</div>
        <button onClick={onThemeToggle} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }} className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            {unreadNotifications.length > 0 && <span className="absolute top-1 right-1 w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full flex items-center justify-center">{unreadNotifications.length}</span>}
          </button>
          {showNotifications && (<>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <button onClick={() => { setShowNotifications(false); navigate('/notifications'); }} className="text-sm text-blue-600 hover:text-blue-700">View all</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {mockNotifications.slice(0, 5).map(n => (
                  <div key={n.id} className={cn('px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer', !n.isRead && 'bg-blue-50/50')} onClick={() => { setShowNotifications(false); navigate(n.link || '/notifications'); }}>
                    <div className="flex items-start gap-3">
                      <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : n.type === 'success' ? 'bg-green-500' : 'bg-blue-500')} />
                      <div><p className="text-sm font-medium text-gray-900">{n.title}</p><p className="text-sm text-gray-600 mt-0.5 line-clamp-2">{n.message}</p></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-gray-200">
                <button onClick={() => { setShowNotifications(false); navigate('/notifications'); }} className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">View All Notifications</button>
              </div>
            </div>
          </>)}
        </div>

        {/* Profile */}
        <div className="relative">
          <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }} className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-100">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">{user?.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="hidden md:block text-left"><p className="text-sm font-medium text-gray-900">{user?.name}</p><p className="text-xs text-gray-500 capitalize">{user?.role.replace('_', ' ')}</p></div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showProfile && (<>
            <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 py-2">
              <div className="px-4 py-3 border-b border-gray-200"><p className="font-medium text-gray-900">{user?.name}</p><p className="text-sm text-gray-500">{user?.email}</p></div>
              <div className="py-1">
                <button onClick={() => { setShowProfile(false); navigate('/profile'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><User className="w-4 h-4" /> My Profile</button>
                <button onClick={() => { setShowProfile(false); navigate('/account-settings'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Settings className="w-4 h-4" /> Account Settings</button>
                <button onClick={() => { setShowProfile(false); navigate('/help-support'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><HelpCircle className="w-4 h-4" /> Help & Support</button>
              </div>
              <div className="border-t border-gray-200 pt-1 mt-1">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4" /> Logout</button>
              </div>
            </div>
          </>)}
        </div>
      </div>
    </header>
  );
};
