import express from 'express';
import { prisma } from '../index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all mindmaps for authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    const mindmaps = await prisma.mindmap.findMany({
      where: {
        OR: [
          { userId }, // User's own mindmaps
          { 
            collaborations: {
              some: { userId }
            }
          } // Shared mindmaps
        ]
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: {
            nodes: true,
            connections: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(mindmaps);
  } catch (error) {
    console.error('Get mindmaps error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single mindmap by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const mindmap = await prisma.mindmap.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        nodes: {
          orderBy: { createdAt: 'asc' }
        },
        connections: {
          include: {
            fromNode: true,
            toNode: true
          }
        },
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!mindmap) {
      return res.status(404).json({ error: 'Mindmap not found' });
    }

    // Check if user has access to this mindmap
    const hasAccess = mindmap.isPublic || 
      mindmap.userId === userId ||
      mindmap.collaborations.some(collab => collab.userId === userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(mindmap);
  } catch (error) {
    console.error('Get mindmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new mindmap
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, isPublic = false } = req.body;
    const userId = req.user!.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const mindmap = await prisma.mindmap.create({
      data: {
        title,
        description,
        isPublic,
        userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        nodes: true,
        connections: true,
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.status(201).json(mindmap);
  } catch (error) {
    console.error('Create mindmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update mindmap
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isPublic } = req.body;
    const userId = req.user!.id;

    // Check if user owns the mindmap or has editor access
    const existingMindmap = await prisma.mindmap.findFirst({
      where: {
        id,
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

    if (!existingMindmap) {
      return res.status(404).json({ error: 'Mindmap not found or access denied' });
    }

    const updatedMindmap = await prisma.mindmap.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic })
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        nodes: true,
        connections: {
          include: {
            fromNode: true,
            toNode: true
          }
        },
        collaborations: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    res.json(updatedMindmap);
  } catch (error) {
    console.error('Update mindmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete mindmap
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user owns the mindmap
    const existingMindmap = await prisma.mindmap.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingMindmap) {
      return res.status(404).json({ error: 'Mindmap not found or access denied' });
    }

    await prisma.mindmap.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete mindmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add collaborator to mindmap
router.post('/:id/collaborators', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'viewer' } = req.body;
    const userId = req.user!.id;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user owns the mindmap
    const mindmap = await prisma.mindmap.findFirst({
      where: { id, userId }
    });

    if (!mindmap) {
      return res.status(404).json({ error: 'Mindmap not found or access denied' });
    }

    // Find user to add as collaborator
    const collaboratorUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!collaboratorUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (collaboratorUser.id === userId) {
      return res.status(400).json({ error: 'Cannot add yourself as collaborator' });
    }

    // Create or update collaboration
    const collaboration = await prisma.collaboration.upsert({
      where: {
        userId_mindmapId: {
          userId: collaboratorUser.id,
          mindmapId: id
        }
      },
      update: { role },
      create: {
        userId: collaboratorUser.id,
        mindmapId: id,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(collaboration);
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove collaborator from mindmap
router.delete('/:id/collaborators/:userId', authenticate, async (req, res) => {
  try {
    const { id, userId: collaboratorId } = req.params;
    const userId = req.user!.id;

    // Check if user owns the mindmap
    const mindmap = await prisma.mindmap.findFirst({
      where: { id, userId }
    });

    if (!mindmap) {
      return res.status(404).json({ error: 'Mindmap not found or access denied' });
    }

    await prisma.collaboration.delete({
      where: {
        userId_mindmapId: {
          userId: collaboratorId,
          mindmapId: id
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;