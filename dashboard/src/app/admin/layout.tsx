'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useDarkMode } from '../../providers/DarkModeProvider';
import { Toaster } from '@/components/ui/toaster';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute>
    <div className="h-screen flex overflow-hidden bg-white dark:bg-black">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-[#1a1a1a]">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center justify-between px-4">
              <h1 className="text-xl font-bold text-black dark:text-white ">Admin Panel</h1>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-black dark:text-white transition-colors"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-[#FFDEDE] text-black dark:bg-[#1a1a1a] dark:text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-[#FFDEDE] hover:text-black dark:hover:text-white"
                    )}
                  >
                    <item.icon className="mr-4 h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className={cn("flex flex-col transition-all duration-300", sidebarCollapsed ? "w-16" : "w-64")}>
          <div className="flex flex-col h-0 flex-1 border-r border-gray-300 dark:border-gray-500 bg-white dark:bg-[#1a1a1a]">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center justify-between flex-shrink-0 px-4">
                {!sidebarCollapsed && (
                  <h1 className="text-xl font-bold text-black dark:text-white">Admin Panel</h1>
                )}
                {sidebarCollapsed ? (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-md text-black dark:text-white hover:bg-accent dark:hover:bg-accent-hover transition-colors"
                      title="Toggle dark mode"
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2 rounded-md text-black dark:text-white hover:bg-accent dark:hover:bg-accent-hover transition-colors"
                      title="Expand sidebar"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-md text-black dark:text-white hover:bg-accent dark:hover:bg-accent-hover transition-colors"
                    >
                      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-2 rounded-md text-black dark:text-white hover:bg-accent dark:hover:bg-accent-hover transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                        ? "bg-[#FFDEDE] text-black"
                        : "text-gray-600 dark:text-gray-300 hover:bg-[#FFDEDE] hover:text-black",
                        sidebarCollapsed && "justify-center"
                      )}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <item.icon className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
                      {!sidebarCollapsed && item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-300 dark:border-gray-500 p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "border-gray-500 text-black hover:bg-black hover:text-white dark:border-gray-400 dark:text-white dark:hover:bg-white dark:hover:text-black",
                  sidebarCollapsed ? "w-8 h-8 p-0" : "w-full"
                )}
                title={sidebarCollapsed ? "Logout" : undefined}
              >
                <LogOut className={cn("h-4 w-4", !sidebarCollapsed && "mr-2")} />
                {!sidebarCollapsed && "Logout"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-black">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
    </ProtectedRoute>
  );
}
