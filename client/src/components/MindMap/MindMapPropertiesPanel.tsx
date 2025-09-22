import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../../store';
import { updateNode } from '../../store/slices/mindmapSlice';
import { setProperties } from '../../store/slices/uiSlice';
import { MindmapNode } from '../../types/local';

const MindMapPropertiesPanel: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { nodes } = useSelector((state: RootState) => state.mindmap);
  const { canvas, showProperties } = useSelector((state: RootState) => state.ui);

  // Get the selected node
  const selectedNodeId = canvas.selectedNodes[0];
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  const handleClose = useCallback(() => {
    dispatch(setProperties(false));
  }, [dispatch]);

  const handleNodeUpdate = useCallback((updates: Partial<MindmapNode>) => {
    if (selectedNodeId) {
      dispatch(updateNode({ id: selectedNodeId, updates }));
    }
  }, [dispatch, selectedNodeId]);

  if (!showProperties || !selectedNode) {
    return null;
  }

  const colors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
    '#3b82f6', '#1e40af', '#1d4ed8', '#2563eb',
    '#10b981', '#059669', '#047857', '#065f46',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
    '#ec4899', '#db2777', '#be185d', '#9d174d',
  ];

  const shapes = [
    { value: 'rounded-rectangle', label: 'Rounded Rectangle' },
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'circle', label: 'Circle' },
    { value: 'ellipse', label: 'Ellipse' },
    { value: 'diamond', label: 'Diamond' },
  ] as const;

  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32];
  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: 'lighter', label: 'Light' },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-30 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Node Properties</h2>
        <button
          onClick={handleClose}
          className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Text Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Content
          </label>
          <textarea
            value={selectedNode.text}
            onChange={(e) => handleNodeUpdate({ text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Enter node text..."
          />
        </div>

        {/* Shape */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Shape
          </label>
          <select
            value={selectedNode.shape}
            onChange={(e) => handleNodeUpdate({ shape: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {shapes.map((shape) => (
              <option key={shape.value} value={shape.value}>
                {shape.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dimensions
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width</label>
              <input
                type="number"
                value={selectedNode.width}
                onChange={(e) => handleNodeUpdate({ width: parseInt(e.target.value) || 150 })}
                min="50"
                max="500"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
              <input
                type="number"
                value={selectedNode.height}
                onChange={(e) => handleNodeUpdate({ height: parseInt(e.target.value) || 50 })}
                min="30"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Background Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Background Color
          </label>
          <div className="grid grid-cols-7 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleNodeUpdate({ backgroundColor: color })}
                className={`w-8 h-8 rounded border-2 ${
                  selectedNode.backgroundColor === color
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2">
            <input
              type="color"
              value={selectedNode.backgroundColor}
              onChange={(e) => handleNodeUpdate({ backgroundColor: e.target.value })}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Text Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Color
          </label>
          <div className="grid grid-cols-7 gap-2">
            {['#ffffff', '#f3f4f6', '#9ca3af', '#6b7280', '#374151', '#1f2937', '#000000'].map((color) => (
              <button
                key={color}
                onClick={() => handleNodeUpdate({ color })}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  selectedNode.color === color
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="mt-2">
            <input
              type="color"
              value={selectedNode.color}
              onChange={(e) => handleNodeUpdate({ color: e.target.value })}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Typography */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Typography
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Font Size</label>
              <select
                value={selectedNode.fontSize}
                onChange={(e) => handleNodeUpdate({ fontSize: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Font Weight</label>
              <select
                value={selectedNode.fontWeight}
                onChange={(e) => handleNodeUpdate({ fontWeight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontWeights.map((weight) => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">X Position</label>
              <input
                type="number"
                value={Math.round(selectedNode.x)}
                onChange={(e) => handleNodeUpdate({ x: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Y Position</label>
              <input
                type="number"
                value={Math.round(selectedNode.y)}
                onChange={(e) => handleNodeUpdate({ y: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              const nodeIds = Object.keys(nodes);
              const currentIndex = nodeIds.indexOf(selectedNodeId!);
              
              if (currentIndex > 0) {
                dispatch(setProperties(false));
                // TODO: Select previous node
              }
            }}
            disabled={Object.keys(nodes).indexOf(selectedNodeId!) === 0}
            className="w-full mb-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous Node
          </button>
          <button
            onClick={() => {
              const nodeIds = Object.keys(nodes);
              const currentIndex = nodeIds.indexOf(selectedNodeId!);
              
              if (currentIndex < nodeIds.length - 1) {
                dispatch(setProperties(false));
                // TODO: Select next node
              }
            }}
            disabled={Object.keys(nodes).indexOf(selectedNodeId!) === Object.keys(nodes).length - 1}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindMapPropertiesPanel;