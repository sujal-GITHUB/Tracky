'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../providers/DarkModeProvider';
import api from '@/lib/api';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting login to:', api.defaults.baseURL + '/auth/login');
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.data.token);
        router.push('/admin');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // User-friendly error messages
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Cannot connect to backend server. Please ensure it is running on port 8000.');
      } else if (err.response?.status === 401 || err.response?.data?.message?.includes('Invalid credentials')) {
        setError('Wrong email or password. Please check your credentials and try again.');
      } else if (err.response?.status === 400) {
        setError('Please enter a valid email and password.');
      } else if (err.response?.status === 500) {
        setError('Something went wrong on our end. Please try again in a moment.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center py-4 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-black dark:text-gray-500" /> : <Moon className="h-5 w-5 text-black dark:text-gray-500" />}
          </button>
        </div>

        <div>
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-gray-200 dark:bg-[#1a1a1a]">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff0000]" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-xl sm:text-2xl lg:text-3xl font-extrabold text-black dark:text-white">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-500">
            Sign in to access the admin panel
          </p>
        </div>

        <form className="mt-4 sm:mt-6 lg:mt-8 space-y-3 sm:space-y-4 lg:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-black dark:text-white">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 sm:py-2.5 pl-10 text-sm sm:text-base border border-gray-500 text-black dark:text-white bg-white dark:bg-[#1a1a1a] rounded-md"
                  placeholder="admin@getsugatenshou.com"
                />
                <Mail className="absolute left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-black dark:text-gray-500 z-20" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-black dark:text-white">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 sm:py-2.5 pl-10 pr-10 text-sm sm:text-base border border-gray-500 text-black dark:text-white bg-white dark:bg-[#1a1a1a] rounded-md"
                  placeholder="Password"
                />
                <Lock className="absolute left-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-black dark:text-gray-500 z-20" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-black dark:text-gray-500 z-20"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-center">
              <p className="text-xs sm:text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800">
                {error}
              </p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-3 sm:py-2.5 sm:px-4 lg:py-3 lg:px-6 text-xs sm:text-sm lg:text-base font-medium rounded-md text-white bg-black dark:bg-white cursor-pointer hover:scale-105 transition-transform duration-200 dark:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Getsugatenshou Admin Panel
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;