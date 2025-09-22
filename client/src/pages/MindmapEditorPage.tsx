import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchMindmap, saveMindmap, markAsSaved, updateMindmapInfo } from '../store/slices/mindmapSlice';
import { addNotification } from '../store/slices/uiSlice';
import MindMapCanvas from '../components/MindMap/MindMapCanvas';
import MindMapToolbar from '../components/MindMap/MindMapToolbar';
import MindMapPropertiesPanel from '../components/MindMap/MindMapPropertiesPanel';
import ExportModal from '../components/MindMap/ExportModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ThemeToggle from '../components/UI/ThemeToggle';

const MindmapEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const stageRef = useRef<any>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  
  const { isLoading, error, title, hasUnsavedChanges } = useSelector((state: RootState) => state.mindmap);
  const { user } = useSelector((state: RootState) => state.auth);

  // Load mind map data
  useEffect(() => {
    if (id) {
      dispatch(fetchMindmap(id));
    }
  }, [dispatch, id]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!id || !hasUnsavedChanges) return;
    
    try {
      await dispatch(saveMindmap()).unwrap();
      dispatch(addNotification({
        type: 'success',
        title: 'Saved',
        message: 'Mind map saved successfully',
        duration: 2000,
      }));
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save mind map. Please try again.',
        duration: 4000,
      }));
    }
  }, [dispatch, id, hasUnsavedChanges]);

  // Handle export
  const handleExport = useCallback(() => {
    setShowExportModal(true);
  }, []);

  // Handle undo/redo (placeholder for now)
  const handleUndo = useCallback(() => {
    dispatch(addNotification({
      type: 'info',
      title: 'Undo',
      message: 'Undo functionality coming soon!',
      duration: 2000,
    }));
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(addNotification({
      type: 'info',
      title: 'Redo',
      message: 'Redo functionality coming soon!',
      duration: 2000,
    }));
  }, [dispatch]);

  // Title editing functions
  const handleTitleClick = useCallback(() => {
    setIsEditingTitle(true);
    setEditTitle(title || 'Untitled Mind Map');
  }, [title]);

  const handleTitleSave = useCallback(() => {
    const newTitle = editTitle.trim() || 'Untitled Mind Map';
    if (newTitle !== title) {
      dispatch(updateMindmapInfo({ title: newTitle }));
    }
    setIsEditingTitle(false);
  }, [dispatch, editTitle, title]);

  const handleTitleCancel = useCallback(() => {
    setIsEditingTitle(false);
    setEditTitle(title || 'Untitled Mind Map');
  }, [title]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
  }, [handleTitleSave, handleTitleCancel]);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Don't handle shortcuts while editing title
      if (isEditingTitle) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleSave, handleUndo, handleRedo, isEditingTitle]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges || !id) return;

    const autoSaveTimer = setTimeout(() => {
      handleSave();
    }, 10000); // Auto-save every 10 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [hasUnsavedChanges, id, handleSave]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        // Attempt to save before leaving
        handleSave();
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, handleSave]);

  // Handle errors
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Mind Map</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || !id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading mind map...</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Editable Title */}
            <div className="flex items-center min-w-0 flex-1">
              {isEditingTitle ? (
                <div className="flex items-center space-x-2 flex-1">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={handleTitleKeyDown}
                    onBlur={handleTitleSave}
                    className="text-xl font-semibold text-gray-900 dark:text-white bg-transparent border-b-2 border-blue-500 dark:border-blue-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-300 min-w-0 flex-1 max-w-md"
                    placeholder="Enter mind map title..."
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    title="Save title (Enter)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleTitleCancel}
                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Cancel (Escape)"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleTitleClick}
                  className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate text-left flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-1"
                  title="Click to edit title"
                >
                  <span className="truncate">
                    {title || 'Untitled Mind Map'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 hover:text-orange-900 dark:hover:text-orange-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                title="Click to save changes (Ctrl+S)"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Unsaved changes
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Editing as {user?.name}</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Online"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Mind Map Canvas */}
        <MindMapCanvas mindmapId={id} stageRef={stageRef} />
        
        {/* Floating Toolbar */}
        <MindMapToolbar
          onSave={handleSave}
          onExport={handleExport}
          canUndo={false} // TODO: Implement undo/redo state
          canRedo={false} // TODO: Implement undo/redo state
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
        
        {/* Properties Panel */}
        <MindMapPropertiesPanel />
      </div>
      
      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stageRef={stageRef}
      />
    </div>
  );
};

export default MindmapEditorPage;
