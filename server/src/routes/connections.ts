import express from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Check if user has edit access to mindmap
const checkEditAccess = async (mindmapId: string, userId: string) => {
  const mindmap = await prisma.mindmap.findFirst({
    where: {
      id: mindmapId,
      OR: [
        { userId },
        {
          collaborations: {
            some: {
              userId,
              role: { in: ['editor', 'owner'] }
            }
          }
        }
      ]
    }
  });
  return !!mindmap;
};

// Create connection between nodes
router.post('/', authenticate, async (req, res) => {
  try {
    const { mindmapId, fromNodeId, toNodeId, label, style = 'solid', color = '#6b7280' } = req.body;
    const userId = req.user!.id;

    if (!mindmapId || !fromNodeId || !toNodeId) {
      return res.status(400).json({ error: 'Mindmap ID, fromNodeId, and toNodeId are required' });
    }

    if (fromNodeId === toNodeId) {
      return res.status(400).json({ error: 'Cannot connect node to itself' });
    }

    // Check edit access
    const hasAccess = await checkEditAccess(mindmapId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify nodes belong to the mindmap
    const nodes = await prisma.node.findMany({
      where: {
        id: { in: [fromNodeId, toNodeId] },
        mindmapId
      }
    });

    if (nodes.length !== 2) {
      return res.status(400).json({ error: 'One or both nodes not found in this mindmap' });
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        mindmapId,
        fromNodeId,
        toNodeId
      }
    });

    if (existingConnection) {
      return res.status(409).json({ error: 'Connection already exists' });
    }

    const connection = await prisma.connection.create({
      data: {
        mindmapId,
        fromNodeId,
        toNodeId,
        label: label || null,
        style,
        color
      },
      include: {
        fromNode: true,
        toNode: true
      }
    });

    res.status(201).json(connection);
  } catch (error) {
    console.error('Create connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update connection
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, style, color } = req.body;
    const userId = req.user!.id;

    // Get connection to check mindmap access
    const existingConnection = await prisma.connection.findUnique({
      where: { id },
      select: { mindmapId: true }
    });

    if (!existingConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check edit access
    const hasAccess = await checkEditAccess(existingConnection.mindmapId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedConnection = await prisma.connection.update({
      where: { id },
      data: {
        ...(label !== undefined && { label: label || null }),
        ...(style !== undefined && { style }),
        ...(color !== undefined && { color })
      },
      include: {
        fromNode: true,
        toNode: true
      }
    });

    res.json(updatedConnection);
  } catch (error) {
    console.error('Update connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete connection
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get connection to check mindmap access
    const existingConnection = await prisma.connection.findUnique({
      where: { id },
      select: { mindmapId: true }
    });

    if (!existingConnection) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    // Check edit access
    const hasAccess = await checkEditAccess(existingConnection.mindmapId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.connection.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get connections for a specific mindmap
router.get('/mindmap/:mindmapId', authenticate, async (req, res) => {
  try {
    const { mindmapId } = req.params;
    const userId = req.user!.id;

    // Check read access
    const mindmap = await prisma.mindmap.findFirst({
      where: {
        id: mindmapId,
        OR: [
          { userId },
          { isPublic: true },
          {
            collaborations: {
              some: { userId }
            }
          }
        ]
      }
    });

    if (!mindmap) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const connections = await prisma.connection.findMany({
      where: { mindmapId },
      include: {
        fromNode: true,
        toNode: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(connections);
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;