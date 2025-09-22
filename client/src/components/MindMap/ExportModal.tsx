import React, { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  DocumentArrowDownIcon,
  PhotoIcon,
  DocumentIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { RootState } from '../../store';
import { 
  exportAsJSON, 
  exportAsPNG, 
  exportAsSVG, 
  downloadFile,
  calculateMindmapBounds 
} from '../../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageRef: React.RefObject<any>; // Konva Stage ref
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, stageRef }) => {
  const { nodes, connections, title } = useSelector((state: RootState) => state.mindmap);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'png' | 'svg' | 'pdf'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    quality: 1,
    backgroundColor: '#ffffff',
    includeBackground: true,
    scale: 1,
  });

  const exportFormats = [
    {
      id: 'png' as const,
      name: 'PNG Image',
      description: 'High-quality raster image format',
      icon: PhotoIcon,
      extension: '.png',
      mimeType: 'image/png',
    },
    {
      id: 'svg' as const,
      name: 'SVG Vector',
      description: 'Scalable vector graphics format',
      icon: DocumentIcon,
      extension: '.svg',
      mimeType: 'image/svg+xml',
    },
    {
      id: 'json' as const,
      name: 'JSON Data',
      description: 'Structured data format for re-importing',
      icon: CodeBracketIcon,
      extension: '.json',
      mimeType: 'application/json',
    },
    {
      id: 'pdf' as const,
      name: 'PDF Document',
      description: 'Portable document format (coming soon)',
      icon: DocumentArrowDownIcon,
      extension: '.pdf',
      mimeType: 'application/pdf',
      disabled: true,
    },
  ];

  const handleExport = async () => {
    if (!stageRef.current) {
      console.error('Stage reference not available');
      return;
    }

    setIsExporting(true);

    try {
      const filename = `${title || 'mindmap'}_${new Date().toISOString().split('T')[0]}`;

      switch (selectedFormat) {
        case 'json':
          const jsonData = exportAsJSON(nodes, connections, title);
          downloadFile(jsonData, `${filename}.json`, 'application/json');
          break;

        case 'png':
          const pngBlob = await exportAsPNG(stageRef.current, exportOptions);
          downloadFile(pngBlob, `${filename}.png`, 'image/png');
          break;

        case 'svg':
          const svgData = exportAsSVG(stageRef.current);
          downloadFile(svgData, `${filename}.svg`, 'image/svg+xml');
          break;

        case 'pdf':
          // TODO: Implement PDF export
          console.log('PDF export not yet implemented');
          break;

        default:
          throw new Error('Unsupported export format');
      }

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      // TODO: Show error notification
    } finally {
      setIsExporting(false);
    }
  };

  const bounds = calculateMindmapBounds(nodes);

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Export Mind Map
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Format Selection */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Export Format</h4>
                  <div className="space-y-2">
                    {exportFormats.map((format) => {
                      const IconComponent = format.icon;
                      return (
                        <button
                          key={format.id}
                          onClick={() => !format.disabled && setSelectedFormat(format.id)}
                          disabled={format.disabled}
                          className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                            selectedFormat === format.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : format.disabled
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium text-sm">{format.name}</div>
                            <div className="text-xs text-gray-500">{format.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Options for image formats */}
                {(selectedFormat === 'png' || selectedFormat === 'svg') && (
                  <div className="mb-6 space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Export Options</h4>
                    
                    {selectedFormat === 'png' && (
                      <>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Quality: {Math.round(exportOptions.quality * 100)}%
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={exportOptions.quality}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              quality: parseFloat(e.target.value) 
                            }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Scale: {exportOptions.scale}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.25"
                            value={exportOptions.scale}
                            onChange={(e) => setExportOptions(prev => ({ 
                              ...prev, 
                              scale: parseFloat(e.target.value) 
                            }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeBackground"
                        checked={exportOptions.includeBackground}
                        onChange={(e) => setExportOptions(prev => ({ 
                          ...prev, 
                          includeBackground: e.target.checked 
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="includeBackground" className="ml-2 text-sm text-gray-700">
                        Include background
                      </label>
                    </div>

                    {exportOptions.includeBackground && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Background Color</label>
                        <input
                          type="color"
                          value={exportOptions.backgroundColor}
                          onChange={(e) => setExportOptions(prev => ({ 
                            ...prev, 
                            backgroundColor: e.target.value 
                          }))}
                          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Preview Info */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Export Preview</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>File: {title || 'mindmap'}_{new Date().toISOString().split('T')[0]}{exportFormats.find(f => f.id === selectedFormat)?.extension}</div>
                    <div>Nodes: {Object.keys(nodes).length}</div>
                    <div>Connections: {Object.keys(connections).length}</div>
                    {selectedFormat !== 'json' && (
                      <div>Canvas Size: {Math.round(bounds.width)} × {Math.round(bounds.height)}px</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExporting ? 'Exporting...' : 'Export'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ExportModal;