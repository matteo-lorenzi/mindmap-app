import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  CursorArrowRaysIcon, 
  HandRaisedIcon as HandOpenIcon,
  PlusCircleIcon, 
  ArrowRightIcon, 
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  BookmarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../../store';
import { setSelectedTool, resetCanvasView, toggleProperties } from '../../store/slices/uiSlice';
import { Tool } from '../../types/local';

interface MindMapToolbarProps {
  onSave: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const MindMapToolbar: React.FC<MindMapToolbarProps> = ({
  onSave,
  onExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTool, canvas, showProperties } = useSelector((state: RootState) => state.ui);
  const { hasUnsavedChanges } = useSelector((state: RootState) => state.mindmap);

  const tools: Array<{ id: Tool; icon: React.ElementType; label: string; shortcut?: string }> = [
    { id: 'select', icon: CursorArrowRaysIcon, label: 'Select', shortcut: 'V' },
    { id: 'pan', icon: HandOpenIcon, label: 'Pan', shortcut: 'H' },
    { id: 'node', icon: PlusCircleIcon, label: 'Add Node', shortcut: 'N' },
    { id: 'connection', icon: ArrowRightIcon, label: 'Connect', shortcut: 'C' },
    { id: 'delete', icon: TrashIcon, label: 'Delete', shortcut: 'D' },
  ];

  const handleToolSelect = (tool: Tool) => {
    dispatch(setSelectedTool(tool));
  };

  const handleResetView = () => {
    dispatch(resetCanvasView());
  };

  const handleToggleProperties = () => {
    dispatch(toggleProperties());
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 space-y-1">
        {/* Main Tools */}
        <div className="space-y-1">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isActive = selectedTool === tool.id;
            
            return (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id)}
                className={`
                  w-10 h-10 flex items-center justify-center rounded-md
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                title={`${tool.label} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
              >
                <IconComponent className="h-5 w-5" />
              </button>
            );
          })}
        </div>

        {/* Separator */}
        <hr className="border-gray-200 dark:border-gray-600" />

        {/* Action Tools */}
        <div className="space-y-1">
          {/* Undo/Redo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              w-10 h-10 flex items-center justify-center rounded-md
              ${canUndo 
                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' 
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }
            `}
            title="Undo (Ctrl+Z)"
          >
            <ArrowUturnLeftIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              w-10 h-10 flex items-center justify-center rounded-md
              ${canRedo 
                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white' 
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              }
            `}
            title="Redo (Ctrl+Y)"
          >
            <ArrowUturnRightIcon className="h-5 w-5" />
          </button>

          {/* Reset View */}
          <button
            onClick={handleResetView}
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            title={`Reset View (Zoom: ${Math.round(canvas.zoom * 100)}%)`}
          >
            <span className="text-xs font-mono">{Math.round(canvas.zoom * 100)}%</span>
          </button>
        </div>

        {/* Separator */}
        <hr className="border-gray-200 dark:border-gray-600" />

        {/* File Operations */}
        <div className="space-y-1">
          {/* Save */}
          <button
            onClick={onSave}
            className={`
              w-10 h-10 flex items-center justify-center rounded-md relative
              ${hasUnsavedChanges 
                ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }
            `}
            title={`Save (Ctrl+S) ${hasUnsavedChanges ? '• Unsaved changes' : '• Saved'}`}
          >
            <BookmarkIcon className="h-5 w-5" />
            {hasUnsavedChanges && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
            )}
          </button>

          {/* Export */}
          <button
            onClick={onExport}
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            title="Export Mind Map"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>

          {/* Properties */}
          <button
            onClick={handleToggleProperties}
            className={`
              w-10 h-10 flex items-center justify-center rounded-md
              ${showProperties 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }
            `}
            title="Node Properties"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          {/* Share */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
            title="Share Mind Map"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tool Information - Hidden to prevent toolbar expansion
      {selectedTool !== 'select' && (
        <div className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-64 fixed">
          <div className="text-sm font-medium text-gray-900 mb-1">
            {tools.find(t => t.id === selectedTool)?.label}
          </div>
          <div className="text-xs text-gray-600">
            {selectedTool === 'pan' && 'Click and drag to pan the canvas. Use mouse wheel to zoom.'}
            {selectedTool === 'node' && 'Click anywhere on the canvas to create a new node.'}
            {selectedTool === 'connection' && 'Click on two nodes to connect them with an arrow.'}
            {selectedTool === 'delete' && 'Click on nodes or connections to delete them.'}
          </div>
        </div>
      )}
      */}

      {/* Connection indicator */}
      {canvas.isConnecting && (
        <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 w-64">
          <div className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
            Creating Connection
          </div>
          <div className="text-xs text-red-600 dark:text-red-300">
            Click on the target node to complete the connection, or press Escape to cancel.
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapToolbar;