import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  overlay = false 
}) => {
  const { isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const { isLoading: mindmapLoading } = useSelector((state: RootState) => state.mindmap);

  // Only show spinner if there's actually loading happening
  const isLoading = authLoading || mindmapLoading;

  if (!isLoading && !overlay) {
    return null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinnerContent = (
    <div className="flex items-center justify-center">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-primary-600`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          {spinnerContent}
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;