import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../../store';
import { applyTheme, selectTheme } from '../../store/slices/settingsSlice';

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentTheme = useSelector(selectTheme);

  const themes = [
    { value: 'light', icon: SunIcon, label: 'Clair' },
    { value: 'dark', icon: MoonIcon, label: 'Sombre' },
    { value: 'auto', icon: ComputerDesktopIcon, label: 'Auto' },
  ] as const;

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    dispatch(applyTheme(theme));
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {themes.map((theme) => {
        const Icon = theme.icon;
        const isActive = currentTheme === theme.value;
        
        return (
          <button
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className={`p-2 rounded-md ${
              isActive
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title={theme.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;