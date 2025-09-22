import React from 'react';
import { Group, Line, Text, Circle } from 'react-konva';
import { Connection, MindmapNode } from '../../types/local';

interface MindMapConnectionProps {
  connection: Connection;
  fromNode: MindmapNode;
  toNode: MindmapNode;
  isSelected: boolean;
  onClick: () => void;
}

const MindMapConnection: React.FC<MindMapConnectionProps> = ({
  connection,
  fromNode,
  toNode,
  isSelected,
  onClick,
}) => {
  // Calculate connection points
  const fromCenter = {
    x: fromNode.x + fromNode.width / 2,
    y: fromNode.y + fromNode.height / 2,
  };
  
  const toCenter = {
    x: toNode.x + toNode.width / 2,
    y: toNode.y + toNode.height / 2,
  };

  // Calculate connection points on the edges of the nodes
  const getConnectionPoint = (from: { x: number; y: number }, to: { x: number; y: number }, nodeWidth: number, nodeHeight: number) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return from;
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    // Calculate intersection with rectangle edges
    const halfWidth = nodeWidth / 2;
    const halfHeight = nodeHeight / 2;
    
    // Check which edge the line intersects
    let intersectX: number, intersectY: number;
    
    if (Math.abs(unitX) > Math.abs(unitY)) {
      // Intersects with left or right edge
      intersectX = unitX > 0 ? halfWidth : -halfWidth;
      intersectY = (intersectX / unitX) * unitY;
      
      // Clamp to node height
      if (Math.abs(intersectY) > halfHeight) {
        intersectY = intersectY > 0 ? halfHeight : -halfHeight;
        intersectX = (intersectY / unitY) * unitX;
      }
    } else {
      // Intersects with top or bottom edge
      intersectY = unitY > 0 ? halfHeight : -halfHeight;
      intersectX = (intersectY / unitY) * unitX;
      
      // Clamp to node width
      if (Math.abs(intersectX) > halfWidth) {
        intersectX = intersectX > 0 ? halfWidth : -halfWidth;
        intersectY = (intersectX / unitX) * unitY;
      }
    }
    
    return {
      x: from.x + intersectX,
      y: from.y + intersectY,
    };
  };

  const startPoint = getConnectionPoint(fromCenter, toCenter, fromNode.width, fromNode.height);
  const endPoint = getConnectionPoint(toCenter, fromCenter, toNode.width, toNode.height);

  // Create curved line points for smooth connections
  const createCurvedLine = () => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    
    // Control points for bezier curve
    const controlOffset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.5;
    
    const cp1x = startPoint.x + (dx > 0 ? controlOffset : -controlOffset);
    const cp1y = startPoint.y;
    
    const cp2x = endPoint.x + (dx > 0 ? -controlOffset : controlOffset);
    const cp2y = endPoint.y;
    
    return [startPoint.x, startPoint.y, cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y];
  };

  const getStraightLine = () => {
    return [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
  };

  const getLinePoints = () => {
    // For now, use straight lines. Can be enhanced with curves later
    return getStraightLine();
  };

  // Calculate arrow head for the connection
  const getArrowPoints = () => {
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return [];
    
    const unitX = dx / distance;
    const unitY = dy / distance;
    
    const arrowLength = 12;
    const arrowWidth = 8;
    
    // Arrow tip
    const tipX = endPoint.x;
    const tipY = endPoint.y;
    
    // Arrow base points
    const baseX = tipX - unitX * arrowLength;
    const baseY = tipY - unitY * arrowLength;
    
    // Perpendicular vector for arrow width
    const perpX = -unitY * arrowWidth / 2;
    const perpY = unitX * arrowWidth / 2;
    
    return [
      tipX, tipY,
      baseX + perpX, baseY + perpY,
      baseX - perpX, baseY - perpY,
      tipX, tipY,
    ];
  };

  // Calculate label position (middle of the line)
  const labelPosition = {
    x: (startPoint.x + endPoint.x) / 2,
    y: (startPoint.y + endPoint.y) / 2,
  };

  // Line style properties
  const getLineStyle = () => {
    switch (connection.style) {
      case 'dashed':
        return [10, 5];
      case 'dotted':
        return [2, 3];
      default:
        return [];
    }
  };

  return (
    <Group onClick={onClick} onTap={onClick}>
      {/* Main connection line */}
      <Line
        points={getLinePoints()}
        stroke={connection.color}
        strokeWidth={isSelected ? 3 : 2}
        dash={getLineStyle()}
        opacity={isSelected ? 1 : 0.8}
        shadowColor="black"
        shadowBlur={isSelected ? 4 : 0}
        shadowOpacity={isSelected ? 0.2 : 0}
        hitStrokeWidth={10} // Larger hit area for easier selection
      />
      
      {/* Arrow head */}
      <Line
        points={getArrowPoints()}
        closed={true}
        fill={connection.color}
        stroke={connection.color}
        strokeWidth={1}
        opacity={isSelected ? 1 : 0.8}
      />
      
      {/* Connection label */}
      {connection.label && (
        <Group>
          {/* Label background */}
          <Circle
            x={labelPosition.x}
            y={labelPosition.y}
            radius={connection.label.length * 4 + 8}
            fill="white"
            stroke={connection.color}
            strokeWidth={1}
            opacity={0.9}
          />
          
          {/* Label text */}
          <Text
            x={labelPosition.x}
            y={labelPosition.y}
            text={connection.label}
            fontSize={12}
            fontFamily="Inter, system-ui, sans-serif"
            fill={connection.color}
            align="center"
            verticalAlign="middle"
            offsetX={connection.label.length * 3}
            offsetY={6}
          />
        </Group>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <>
          {/* Selection handles at start and end */}
          <Circle
            x={startPoint.x}
            y={startPoint.y}
            radius={4}
            fill="white"
            stroke="#1d4ed8"
            strokeWidth={2}
          />
          <Circle
            x={endPoint.x}
            y={endPoint.y}
            radius={4}
            fill="white"
            stroke="#1d4ed8"
            strokeWidth={2}
          />
          
          {/* Mid-point handle */}
          <Circle
            x={labelPosition.x}
            y={labelPosition.y}
            radius={3}
            fill="#1d4ed8"
            opacity={0.7}
          />
        </>
      )}
    </Group>
  );
};

export default MindMapConnection;