import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  addNode, 
  updateNode, 
  deleteNode, 
  addConnection, 
  deleteConnection 
} from '../../store/slices/mindmapSlice';
import { 
  updateCanvasState, 
  setSelectedTool, 
  startConnecting, 
  stopConnecting,
  selectNodes,
  clearSelection,
  setProperties
} from '../../store/slices/uiSlice';
import { MindmapNode } from '../../types/local';
import MindMapNode from './MindMapNode';
import MindMapConnection from './MindMapConnection';

interface MindMapCanvasProps {
  mindmapId: string;
  stageRef?: React.RefObject<any>;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ mindmapId, stageRef: externalStageRef }) => {
  const dispatch = useDispatch<AppDispatch>();
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPointerPos, setLastPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 });
  
  // Animation frame ref for smooth updates
  const animationFrameRef = useRef<number>();
  const lastReduxUpdateRef = useRef<number>(0);
  const REDUX_UPDATE_THROTTLE = 50; // Update Redux every 50ms maximum

  // Use external ref if provided, otherwise use internal ref
  const currentStageRef = externalStageRef || stageRef;

  // Redux state
  const { nodes, connections } = useSelector((state: RootState) => state.mindmap);
  const { canvas, selectedTool } = useSelector((state: RootState) => state.ui);

  // Update stage dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    // Initial measurement
    updateDimensions();

    // Use ResizeObserver for accurate container size tracking
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback to window resize for older browsers
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleStageClick = useCallback((e: any) => {
    // Check if clicked on empty area
    if (e.target === e.target.getStage()) {
      if (selectedTool === 'node') {
        // Create new node at click position
        const pos = e.target.getStage().getPointerPosition();
        const newNode: Partial<MindmapNode> = {
          id: `node_${Date.now()}`, // Temporary ID - backend will assign real ID
          text: 'New Node',
          x: (pos.x - stagePos.x) / stageScale,
          y: (pos.y - stagePos.y) / stageScale,
          width: 150,
          height: 50,
          color: '#ffffff', // White text color
          backgroundColor: '#6b7280', // Grey background
          fontSize: 14,
          fontWeight: 'normal',
          shape: 'rectangle',
          mindmapId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        dispatch(addNode(newNode as MindmapNode));
        dispatch(setSelectedTool('select'));
      } else {
        // Clear selection
        dispatch(clearSelection());
        dispatch(stopConnecting());
      }
    }
  }, [dispatch, selectedTool, stageScale, stagePos, mindmapId]);

  const handleNodeClick = useCallback((nodeId: string) => {
    // Prevent event bubbling to stage
    if (selectedTool === 'node') {
      // When node tool is selected, clicking on existing nodes should not trigger any action
      // This allows stage clicks to create new nodes
      return;
    }
    
    if (canvas.isConnecting && canvas.connectingFromNode) {
      // Complete connection
      if (canvas.connectingFromNode !== nodeId) {
        const newConnection = {
          id: `conn_${Date.now()}`,
          fromNodeId: canvas.connectingFromNode,
          toNodeId: nodeId,
          mindmapId,
          color: '#6b7280',
          strokeColor: '#6b7280',
          strokeWidth: 2,
          style: 'solid' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        dispatch(addConnection(newConnection));
      }
      dispatch(stopConnecting());
    } else if (selectedTool === 'connection') {
      // Start connection
      dispatch(startConnecting(nodeId));
    } else if (selectedTool === 'delete') {
      // Delete node
      dispatch(deleteNode(nodeId));
    } else {
      // Select node
      dispatch(selectNodes([nodeId]));
      // Auto-open properties panel for selected node
      dispatch(setProperties(true));
    }
  }, [dispatch, canvas, selectedTool, mindmapId]);

  const handleNodeDoubleClick = useCallback((nodeId: string) => {
    // Enable text editing
    const nodeElement = document.getElementById(`node-text-${nodeId}`);
    if (nodeElement) {
      nodeElement.focus();
    }
  }, []);

  const handleNodeDragEnd = useCallback((nodeId: string, pos: { x: number; y: number }) => {
    // Mettre à jour la position finale du nœud dans le store Redux
    dispatch(updateNode({ 
      id: nodeId, 
      updates: { x: pos.x, y: pos.y } 
    }));
  }, [dispatch]);

  const handleNodeDragMove = useCallback((nodeId: string, pos: { x: number; y: number }) => {
    // Optionnel : mise à jour en temps réel pendant le drag
    // Pour l'instant, on laisse Konva gérer l'affichage temps réel
    // et on ne met à jour Redux qu'à la fin du drag
  }, []);

  const handleConnectionClick = useCallback((connectionId: string) => {
    if (selectedTool === 'delete') {
      dispatch(deleteConnection(connectionId));
    }
  }, [dispatch, selectedTool]);

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setStageScale(clampedScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    setStagePos(newPos);
    
    // Update canvas state
    dispatch(updateCanvasState({
      zoom: clampedScale,
      panX: newPos.x,
      panY: newPos.y
    }));
  }, [dispatch]);

  // Space key panning functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle space if not in an input field and not already pressed
      if (e.code === 'Space' && !e.repeat && !isSpacePressed) {
        const target = e.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true';
        
        if (!isInputField) {
          e.preventDefault();
          setIsSpacePressed(true);
          document.body.style.cursor = 'grab';
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
        setIsPanning(false);
        setLastPointerPos(null);
        document.body.style.cursor = '';
      }
    };

    // Use capture phase to ensure we get the events first
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
      document.body.style.cursor = '';
      
      // Clean up any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isSpacePressed]);

  // Handle stage mouse events for space+drag panning
  const handleStageMouseDown = useCallback((e: any) => {
    if (isSpacePressed) {
      setIsPanning(true);
      document.body.style.cursor = 'grabbing';
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      setLastPointerPos(pos);
      e.cancelBubble = true;
    }
  }, [isSpacePressed]);

  const handleStageMouseMove = useCallback((e: any) => {
    if (isPanning && isSpacePressed && lastPointerPos) {
      const stage = e.target.getStage();
      const currentPos = stage.getPointerPosition();
      
      if (currentPos && lastPointerPos) {
        // Calculate the delta movement
        const deltaX = currentPos.x - lastPointerPos.x;
        const deltaY = currentPos.y - lastPointerPos.y;
        
        // Update local stage position immediately for smooth visual feedback
        const newPos = {
          x: stagePos.x + deltaX,
          y: stagePos.y + deltaY
        };
        
        // Cancel any pending animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Update local state immediately
        animationFrameRef.current = requestAnimationFrame(() => {
          setStagePos(newPos);
          setLastPointerPos(currentPos);
          
          // Throttle Redux updates to prevent performance issues
          const now = Date.now();
          if (now - lastReduxUpdateRef.current > REDUX_UPDATE_THROTTLE) {
            dispatch(updateCanvasState({ panX: newPos.x, panY: newPos.y }));
            lastReduxUpdateRef.current = now;
          }
        });
      }
    }
  }, [isPanning, isSpacePressed, lastPointerPos, stagePos, dispatch]);

  const handleStageMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      setLastPointerPos(null);
      
      // Cancel any pending animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Final Redux update to ensure state is synchronized
      dispatch(updateCanvasState({ panX: stagePos.x, panY: stagePos.y }));
      
      if (isSpacePressed) {
        document.body.style.cursor = 'grab';
      } else {
        document.body.style.cursor = '';
      }
    }
  }, [isPanning, isSpacePressed, stagePos, dispatch]);

  // Convert nodes object to array
  const nodeArray = Object.values(nodes);
  const connectionArray = Object.values(connections);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 dark:bg-gray-900"
    >
      {/* Canvas Instructions */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-600 dark:text-gray-300">
        {selectedTool === 'select' && 'Click to select • Drag to move • Double-click to edit • Hold Space + drag to pan'}
        {selectedTool === 'node' && 'Click anywhere to create a new node • Hold Space + drag to pan'}
        {selectedTool === 'connection' && 'Click two nodes to connect them • Hold Space + drag to pan'}
        {selectedTool === 'delete' && 'Click nodes or connections to delete them • Hold Space + drag to pan'}
        {selectedTool === 'pan' && 'Drag to pan the canvas • Use mouse wheel to zoom • Hold Space + drag to pan'}
        {isSpacePressed && (
          <div className="mt-2 text-blue-600 dark:text-blue-400 font-medium">
            🚀 Space Pan Mode - Drag to move canvas
          </div>
        )}
      </div>

      {/* Canvas */}
      <Stage
        ref={currentStageRef}
        width={stageDimensions.width}
        height={stageDimensions.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onTap={handleStageClick}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={selectedTool === 'pan' && !isPanning}
        onDragStart={(e) => {
          // Only allow stage dragging if we're in pan mode and not space+dragging
          if (selectedTool !== 'pan' || isPanning) {
            e.target.stopDrag();
          }
        }}
        onDragEnd={(e) => {
          // Only update stage position if this was a stage drag (not a node drag)
          if (e.target === e.target.getStage()) {
            const pos = e.target.position();
            setStagePos(pos);
            dispatch(updateCanvasState({ panX: pos.x, panY: pos.y }));
          }
        }}
      >
        <Layer>
          {/* Render connections first (so they appear behind nodes) */}
          {connectionArray.map((connection) => {
            const fromNode = nodes[connection.fromNodeId];
            const toNode = nodes[connection.toNodeId];
            
            if (!fromNode || !toNode) return null;
            
            return (
              <MindMapConnection
                key={connection.id}
                connection={connection}
                fromNode={fromNode}
                toNode={toNode}
                isSelected={canvas.selectedConnections.includes(connection.id)}
                onClick={() => handleConnectionClick(connection.id)}
              />
            );
          })}
          
          {/* Render nodes */}
          {nodeArray.map((node) => (
            <MindMapNode
              key={node.id}
              node={node}
              isSelected={canvas.selectedNodes.includes(node.id)}
              isConnecting={canvas.isConnecting && canvas.connectingFromNode === node.id}
              onClick={() => handleNodeClick(node.id)}
              onDoubleClick={() => handleNodeDoubleClick(node.id)}
              onDragEnd={(pos) => handleNodeDragEnd(node.id, pos)}
              onTextChange={(newText) => 
                dispatch(updateNode({ id: node.id, updates: { text: newText } }))
              }
            />
          ))}
        </Layer>
      </Stage>

      {/* Canvas Stats */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2 text-xs text-gray-500 dark:text-gray-400">
        Nodes: {nodeArray.length} • Connections: {connectionArray.length} • Zoom: {Math.round(stageScale * 100)}%
      </div>
    </div>
  );
};

export default MindMapCanvas;