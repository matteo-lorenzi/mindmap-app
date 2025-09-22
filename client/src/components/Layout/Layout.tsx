import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { createMindmap } from '../../store/slices/mindmapSlice';
import ThemeToggle from '../UI/ThemeToggle';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { showSidebar } = useSelector((state: RootState) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateMindmap = async () => {
    try {
      // Create a new mind map with default data
      const newMindmapData = {
        title: 'Untitled Mind Map',
        description: 'A new mind map ready for your ideas',
        isPublic: false
      };

      // Dispatch the createMindmap action
      const result = await dispatch(createMindmap(newMindmapData));
      
      if (createMindmap.fulfilled.match(result)) {
        // Navigate to the new mind map editor
        navigate(`/mindmap/${result.payload.id}`);
      }
    } catch (error) {
      console.error('Failed to create new mind map:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {showSidebar && (
        <div className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">MindMap</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HomeIcon className="h-5 w-5 mr-3" />
                Dashboard
              </button>

              <button
                onClick={handleCreateMindmap}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <PlusIcon className="h-5 w-5 mr-3" />
                New Mind Map
              </button>

              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Account
                </p>
                <div className="mt-2 space-y-1">
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-3" />
                    Settings
                  </button>
                </div>
              </div>
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {!showSidebar && (
                  <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="mr-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Mind Maps
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {showSidebar && (
                  <button
                    onClick={() => dispatch(toggleSidebar())}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Hide sidebar"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <ThemeToggle />

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;