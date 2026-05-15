// ==========================================
// KRIFY SOFTWARE TECHNOLOGIES
// LOGIN PAGE
// ==========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { cn } from '../utils/cn';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials
  const demoCredentials = [
    { email: 'krishna@krify.com', role: 'Super Admin' },
    { email: 'madhav@krify.com', role: 'Project Manager' },
    { email: 'sudha@krify.com', role: 'Sales Coordinator' },
    { email: 'karimunnisa@krify.com', role: 'Developer' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 p-12 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">KRIFY</h1>
                <p className="text-blue-200 text-sm">Software Technologies</p>
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Project Management Portal</h2>
            <p className="text-blue-100 leading-relaxed">
              Streamline your project workflows, track resources, manage milestones, 
              and collaborate with your team efficiently.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">24</span>
              </div>
              <div>
                <p className="font-medium">Active Team Members</p>
                <p className="text-sm text-blue-200">Across multiple business units</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">8</span>
              </div>
              <div>
                <p className="font-medium">Active Projects</p>
                <p className="text-sm text-blue-200">Running, dedicated & maintenance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-2">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all',
                  isLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center mb-4">Demo Credentials (Password: &quot;password&quot;)</p>
              <div className="space-y-2">
                {demoCredentials.map((cred) => (
                  <button
                    key={cred.email}
                    onClick={() => setEmail(cred.email)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <p className="text-sm font-medium text-gray-900">{cred.email}</p>
                    <p className="text-xs text-gray-500">{cred.role}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
