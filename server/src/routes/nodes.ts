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

// Create node in mindmap
router.post('/', authenticate, async (req, res) => {
  try {
    const { mindmapId, text, x, y, width = 150, height = 50, color = '#3b82f6', fontSize = 14, shape = 'rectangle' } = req.body;
    const userId = req.user!.id;

    if (!mindmapId || !text) {
      return res.status(400).json({ error: 'Mindmap ID and text are required' });
    }

    // Check edit access
    const hasAccess = await checkEditAccess(mindmapId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const node = await prisma.node.create({
      data: {
        mindmapId,
        text,
        x: parseFloat(x.toString()),
        y: parseFloat(y.toString()),
        width: parseFloat(width.toString()),
        height: parseFloat(height.toString()),
        color,
        fontSize: parseInt(fontSize.toString()),
        shape
      }
    });

    res.status(201).json(node);
  } catch (error) {
    console.error('Create node error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update node
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, x, y, width, height, color, fontSize, shape } = req.body;
    const userId = req.user!.id;

    // Get node to check mindmap access
    const existingNode = await prisma.node.findUnique({
      where: { id },
      select: { mindmapId: true }
    });

    if (!existingNode) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Check edit access
    const hasAccess = await checkEditAccess(existingNode.mindmapId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedNode = await prisma.node.update({
      where: { id },
      data: {
        ...(text !== undefined && { text }),
        ...(x !== undefined && { x: parseFloat(x.toString()) }),
        ...(y !== undefined && { y: parseFloat(y.toString()) }),
        ...(width !== undefined && { width: parseFloat(width.toString()) }),
        ...(height !== undefined && { height: parseFloat(height.toString()) }),
        ...(color !== undefined && { color }),
        ...(fontSize !== undefined && { fontSize: parseInt(fontSize.toString()) }),
        ...(shape !== undefined && { shape })
      }
    });

    res.json(updatedNode);
  } catch (error) {
    console.error('Update node error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete node
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Get node to check mindmap access
    const existingNode = await prisma.node.findUnique({
      where: { id },
      select: { mindmapId: true }
    });

    if (!existingNode) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Check edit access
    const hasAccess = await checkEditAccess(existingNode.mindmapId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete node (connections will be cascade deleted)
    await prisma.node.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete node error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Batch update nodes (for drag operations)
router.patch('/batch', authenticate, async (req, res) => {
  try {
    const { updates } = req.body; // Array of { id, x?, y?, width?, height?, ... }
    const userId = req.user!.id;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    // Get all nodes and check access for each mindmap
    const nodeIds = updates.map(update => update.id);
    const nodes = await prisma.node.findMany({
      where: { id: { in: nodeIds } },
      select: { id: true, mindmapId: true }
    });

    // Group by mindmap and check access
    const mindmapIds = [...new Set(nodes.map(node => node.mindmapId))];
    const accessChecks = await Promise.all(
      mindmapIds.map(mindmapId => checkEditAccess(mindmapId, userId))
    );

    const hasAccessToAll = accessChecks.every(hasAccess => hasAccess);
    if (!hasAccessToAll) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Perform batch updates
    const updatePromises = updates.map(update => {
      const { id, ...data } = update;
      
      // Convert numeric values
      if (data.x !== undefined) data.x = parseFloat(data.x.toString());
      if (data.y !== undefined) data.y = parseFloat(data.y.toString());
      if (data.width !== undefined) data.width = parseFloat(data.width.toString());
      if (data.height !== undefined) data.height = parseFloat(data.height.toString());
      if (data.fontSize !== undefined) data.fontSize = parseInt(data.fontSize.toString());

      return prisma.node.update({
        where: { id },
        data
      });
    });

    const updatedNodes = await Promise.all(updatePromises);
    res.json(updatedNodes);
  } catch (error) {
    console.error('Batch update nodes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;