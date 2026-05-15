// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// PROJECT MANAGEMENT PORTAL
// MAIN APPLICATION COMPONENT
// ==========================================

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Tasks } from './pages/Tasks';
import { Resources } from './pages/Resources';
import { WeeklyMeetings } from './pages/WeeklyMeetings';
import { Milestones } from './pages/Milestones';
import { Maintenance } from './pages/Maintenance';
import { Risks } from './pages/Risks';
import { Reports } from './pages/Reports';
import { DedicatedResources } from './pages/DedicatedResources';
import { Notifications as NotificationsPage } from './pages/Notifications';
import { AdminSettings } from './pages/AdminSettings';
import { Profile } from './pages/Profile';
import { AccountSettings } from './pages/AccountSettings';
import { HelpSupport } from './pages/HelpSupport';

import { cn } from './utils/cn';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main Layout Component
const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className={cn('min-h-screen bg-gray-50', isDarkMode && 'dark')}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      )}>
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
          onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        />
        
        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/running" element={<Projects />} />
            <Route path="/projects/dedicated" element={<DedicatedResources />} />
            <Route path="/projects/maintenance" element={<Maintenance />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/weekly-meetings" element={<WeeklyMeetings />} />
            <Route path="/milestones" element={<Milestones />} />
            <Route path="/risks" element={<Risks />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route path="/admin" element={<AdminSettings />} />
            <Route path="/admin/users" element={<AdminSettings />} />
            <Route path="/admin/roles" element={<AdminSettings />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

// App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
