import React, { useState, useRef, useEffect } from 'react';
import { Group, Rect, Circle, Text } from 'react-konva';
import { MindmapNode } from '../../types/local';

interface MindMapNodeProps {
  node: MindmapNode;
  isSelected: boolean;
  isConnecting: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onDragEnd: (pos: { x: number; y: number }) => void;
  onTextChange: (newText: string) => void;
}

const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isSelected,
  isConnecting,
  onClick,
  onDoubleClick,
  onDragEnd,
  onTextChange,
}) => {
  const groupRef = useRef<any>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [inputPosition, setInputPosition] = useState({ x: 0, y: 0 });

  const DRAG_THRESHOLD = 3;

  const handleDragStart = (e: any) => {
    e.cancelBubble = true; // Empêcher la propagation vers le Stage
    setIsDragging(true);
    const pos = e.target.getStage().getPointerPosition();
    setDragStartPos(pos);
  };

  const handleDragMove = (e: any) => {
    // Mettre à jour la position du nœud en temps réel pendant le drag
    // pour que les connexions suivent immédiatement
    const group = groupRef.current;
    if (group) {
      // Cette fonction sera appelée à chaque mouvement de la souris pendant le drag
      // Les connexions se redessineront automatiquement car elles utilisent
      // les propriétés x et y du Group en temps réel
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const group = groupRef.current;
    if (group) {
      onDragEnd({
        x: group.x(),
        y: group.y(),
      });
    }
    setDragStartPos(null);
  };

  const handleClick = (e: any) => {
    e.cancelBubble = true;
    // Si on n'est pas en train de drag, alors c'est un vrai click
    if (!isDragging) {
      onClick();
    }
  };

  const handleTextEdit = () => {
    if (isEditing) return; // Prevent multiple editing sessions
    
    setIsEditing(true);
    
    // Calculate the absolute position of the node
    const group = groupRef.current;
    if (group) {
      const stage = group.getStage();
      const stageBox = stage.container().getBoundingClientRect();
      const nodeBox = group.getClientRect();
      
      // Calculate position relative to the viewport
      const x = stageBox.left + nodeBox.x + (nodeBox.width / 2);
      const y = stageBox.top + nodeBox.y + (nodeBox.height / 2);
      
      setInputPosition({ x, y });
    }
  };

  const handleInputFinish = (newText?: string) => {
    const finalText = newText !== undefined ? newText : textInputRef.current?.value.trim() || 'New Node';
    if (finalText !== node.text) {
      onTextChange(finalText);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent event from reaching the canvas
    
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputFinish();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false); // Cancel editing without saving
    }
  };

  // Focus the input when editing starts
  useEffect(() => {
    if (isEditing && textInputRef.current) {
      // Add a small delay to ensure the input is rendered
      setTimeout(() => {
        if (textInputRef.current && typeof textInputRef.current.focus === 'function') {
          textInputRef.current.focus();
          textInputRef.current.select();
        }
      }, 50);
    }
  }, [isEditing]);

  const renderShape = () => {
    const shapeProps = {
      width: node.width,
      height: node.height,
      fill: node.backgroundColor || '#6b7280', // Use backgroundColor for fill, fallback to grey
      stroke: isSelected ? '#1d4ed8' : isConnecting ? '#dc2626' : '#e5e7eb',
      strokeWidth: isSelected ? 3 : isConnecting ? 2 : 1,
      shadowColor: 'black',
      shadowBlur: isDragging ? 15 : isSelected ? 8 : 4,
      shadowOpacity: isDragging ? 0.5 : isSelected ? 0.3 : 0.1,
      shadowOffsetX: isDragging ? 5 : 2,
      shadowOffsetY: isDragging ? 5 : 2,
      opacity: isDragging ? 0.9 : 1, // Légèrement transparent pendant le drag pour un feedback visuel
    };

    switch (node.shape) {
      case 'circle':
        return (
          <Circle
            radius={Math.min(node.width, node.height) / 2}
            x={node.width / 2}
            y={node.height / 2}
            {...shapeProps}
          />
        );
      case 'ellipse':
        return (
          <Circle
            radiusX={node.width / 2}
            radiusY={node.height / 2}
            x={node.width / 2}
            y={node.height / 2}
            {...shapeProps}
          />
        );
      case 'diamond':
        return (
          <Group>
            <Rect
              {...shapeProps}
              rotation={45}
              x={node.width / 2}
              y={node.height / 2}
              offsetX={node.width / 2}
              offsetY={node.height / 2}
            />
          </Group>
        );
      case 'rectangle':
      default:
        return (
          <Rect
            {...shapeProps}
            cornerRadius={8}
          />
        );
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={node.x}
        y={node.y}
        draggable={!isEditing}
        onClick={handleClick}
        onTap={handleClick}
        onDblClick={() => {
          if (!isDragging) {
            onDoubleClick();
            handleTextEdit();
          }
        }}
        onDblTap={() => {
          if (!isDragging) {
            onDoubleClick();
            handleTextEdit();
          }
        }}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Node Shape */}
        {renderShape()}
        
        {/* Node Text */}
        {!isEditing && (
          <Text
            text={node.text}
            x={0}
            y={0}
            width={node.width}
            height={node.height}
            align="center"
            verticalAlign="middle"
            fontSize={node.fontSize}
            fontFamily="Inter, system-ui, sans-serif"
            fill={node.color || '#ffffff'} // Use node.color for text, fallback to white
            padding={8}
            wrap="word"
            ellipsis={true}
          />
        )}
        
        {/* Selection Handles */}
        {isSelected && (
          <>
            {/* Corner handles for resizing (future feature) */}
            <Circle
              x={-4}
              y={-4}
              radius={4}
              fill="white"
              stroke="#1d4ed8"
              strokeWidth={2}
            />
            <Circle
              x={node.width + 4}
              y={-4}
              radius={4}
              fill="white"
              stroke="#1d4ed8"
              strokeWidth={2}
            />
            <Circle
              x={node.width + 4}
              y={node.height + 4}
              radius={4}
              fill="white"
              stroke="#1d4ed8"
              strokeWidth={2}
            />
            <Circle
              x={-4}
              y={node.height + 4}
              radius={4}
              fill="white"
              stroke="#1d4ed8"
              strokeWidth={2}
            />
          </>
        )}
        
        {/* Connection indicator */}
        {isConnecting && (
          <Circle
            x={node.width / 2}
            y={node.height / 2}
            radius={8}
            fill="#dc2626"
            opacity={0.8}
          />
        )}
      </Group>

      {/* Inline Text Input - Positioned absolutely over the node */}
      {isEditing && (
        <input
          ref={textInputRef}
          type="text"
          defaultValue={node.text}
          onBlur={() => handleInputFinish()}
          onKeyDown={handleInputKeyDown}
          className="absolute z-50 px-3 py-2 text-center border-2 border-blue-500 rounded-lg shadow-lg outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{
            left: `${inputPosition.x}px`,
            top: `${inputPosition.y}px`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${node.fontSize}px`,
            fontFamily: 'Inter, system-ui, sans-serif',
            minWidth: `${Math.max(node.width, 120)}px`,
            maxWidth: `${node.width + 40}px`,
            zIndex: 1000,
          }}
          autoFocus
        />
      )}
    </>
  );
};

export default MindMapNode;