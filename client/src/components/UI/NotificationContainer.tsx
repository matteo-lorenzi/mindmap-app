import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../../store';
import { removeNotification } from '../../store/slices/uiSlice';
import { Notification } from '../../types';

const NotificationContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  // Auto-remove notifications after their duration
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timeout = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration || 5000);

        return () => clearTimeout(timeout);
      }
    });
  }, [notifications, dispatch]);

  const getNotificationIcon = (type: Notification['type']) => {
    const iconClass = 'h-5 w-5';
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-500`} />;
      case 'info':
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />;
    }
  };

  const getNotificationColors = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`rounded-lg border p-4 shadow-lg animate-slideInRight ${getNotificationColors(
            notification.type
          )}`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="mt-1 text-sm text-gray-700">
                  {notification.message}
                </p>
              )}
              {notification.actions && notification.actions.length > 0 && (
                <div className="mt-3 flex space-x-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        dispatch(removeNotification(notification.id));
                      }}
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        action.style === 'danger'
                          ? 'text-red-700 bg-red-100 hover:bg-red-200'
                          : action.style === 'secondary'
                          ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          : 'text-primary-700 bg-primary-100 hover:bg-primary-200'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => dispatch(removeNotification(notification.id))}
                className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;