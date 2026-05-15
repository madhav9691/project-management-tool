import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import { Settings, Lock, Bell, Eye, EyeOff, Save, CheckCircle2, Monitor, Sun } from 'lucide-react';

export const AccountSettings: React.FC = () => {
  const { } = useAuth();
  const [activeSection, setActiveSection] = useState<'password' | 'notifications' | 'display'>('password');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    taskAssigned: true, taskOverdue: true, taskStatusChange: true,
    projectAssigned: true, milestonePayment: true,
    emailNotifications: false, weeklyDigest: true
  });
  const [displaySettings, setDisplaySettings] = useState({ compactMode: false, darkMode: false });
  const [saved, setSaved] = useState(false);

  const handlePasswordChange = () => {
    setPwError(''); setPwSuccess(false);
    if (!pwForm.oldPassword) { setPwError('Enter current password'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('New password must be at least 6 characters'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match'); return; }
    if (pwForm.oldPassword !== 'password') { setPwError('Current password is incorrect'); return; }
    setPwSuccess(true);
    setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const handleSaveNotif = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleSaveDisplay = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const sections = [
    { id: 'password' as const, label: 'Change Password', icon: Lock },
    { id: 'notifications' as const, label: 'Notification Preferences', icon: Bell },
    { id: 'display' as const, label: 'Display Settings', icon: Monitor },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      <p className="text-gray-500">Manage your account preferences</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
            {sections.map(s => { const I = s.icon; return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left', activeSection === s.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50')}>
                <I className="w-4 h-4" /> {s.label}
              </button>
            ); })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Password */}
          {activeSection === 'password' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-6"><Lock className="w-5 h-5" /> Change Password</h3>
              {pwSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4" /> Password changed successfully!</div>}
              {pwError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{pwError}</div>}
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input type={showOld ? 'text' : 'password'} value={pwForm.oldPassword} onChange={e => setPwForm(p => ({ ...p, oldPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10" placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10" placeholder="At least 6 characters" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Re-enter new password" />
                </div>
                <button onClick={handlePasswordChange} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Save className="w-4 h-4" /> Update Password</button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-6"><Bell className="w-5 h-5" /> Notification Preferences</h3>
              {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4" /> Settings saved!</div>}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-500 uppercase">In-App Notifications</h4>
                {[
                  { key: 'taskAssigned', label: 'New task assigned to me' },
                  { key: 'taskOverdue', label: 'My task is overdue' },
                  { key: 'taskStatusChange', label: 'Task status changes (for PM)' },
                  { key: 'projectAssigned', label: 'Assigned to a new project' },
                  { key: 'milestonePayment', label: 'Milestone payment received' },
                ].map(n => (
                  <label key={n.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <span className="text-sm text-gray-700">{n.label}</span>
                    <input type="checkbox" checked={(notifSettings as any)[n.key]} onChange={e => setNotifSettings(p => ({ ...p, [n.key]: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                  </label>
                ))}
                <h4 className="text-sm font-medium text-gray-500 uppercase pt-4">Email Notifications</h4>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div><span className="text-sm text-gray-700">Email notifications</span><p className="text-xs text-gray-400">Receive email alerts for important events</p></div>
                  <input type="checkbox" checked={notifSettings.emailNotifications} onChange={e => setNotifSettings(p => ({ ...p, emailNotifications: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div><span className="text-sm text-gray-700">Weekly digest</span><p className="text-xs text-gray-400">Receive a summary of your weekly activity</p></div>
                  <input type="checkbox" checked={notifSettings.weeklyDigest} onChange={e => setNotifSettings(p => ({ ...p, weeklyDigest: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <button onClick={handleSaveNotif} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Save className="w-4 h-4" /> Save Preferences</button>
              </div>
            </div>
          )}

          {/* Display */}
          {activeSection === 'display' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-6"><Monitor className="w-5 h-5" /> Display Settings</h3>
              {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm"><CheckCircle2 className="w-4 h-4" /> Settings saved!</div>}
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center gap-3"><Sun className="w-5 h-5 text-yellow-500" /><div><span className="text-sm font-medium text-gray-700">Dark Mode</span><p className="text-xs text-gray-400">Switch to dark theme (coming soon)</p></div></div>
                  <input type="checkbox" checked={displaySettings.darkMode} onChange={e => setDisplaySettings(p => ({ ...p, darkMode: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-gray-500" /><div><span className="text-sm font-medium text-gray-700">Compact Mode</span><p className="text-xs text-gray-400">Reduce spacing for more content on screen</p></div></div>
                  <input type="checkbox" checked={displaySettings.compactMode} onChange={e => setDisplaySettings(p => ({ ...p, compactMode: e.target.checked }))} className="w-4 h-4 text-blue-600 rounded" />
                </label>
                <button onClick={handleSaveDisplay} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"><Save className="w-4 h-4" /> Save Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
