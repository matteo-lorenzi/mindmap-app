import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon, 
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CalendarIcon,
  UsersIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { RootState, AppDispatch } from '../store';
import { fetchMindmaps, createMindmap, deleteMindmap } from '../store/slices/mindmapSlice';
import { addNotification } from '../store/slices/uiSlice';
import { Mindmap, CreateMindmapRequest } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';

interface DashboardStats {
  totalMindmaps: number;
  publicMindmaps: number;
  recentActivity: number;
  collaborations: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'activity';
type FilterBy = 'all' | 'public' | 'private' | 'shared';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { mindmaps, isLoading, error } = useSelector((state: RootState) => state.mindmap);
  const { user } = useSelector((state: RootState) => state.auth);
  
  // UI State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedMindmaps, setSelectedMindmaps] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Form State
  const [newMindmapData, setNewMindmapData] = useState<CreateMindmapRequest>({
    title: '',
    description: '',
    isPublic: false,
  });

  // Fetch mindmaps on component mount
  useEffect(() => {
    dispatch(fetchMindmaps());
  }, [dispatch]);

  // Generate sample mindmaps for testing
  const generateSampleMindmaps = useCallback((): Mindmap[] => {
    if (mindmaps.length > 0) return mindmaps;
    
    return [
      {
        id: '1',
        userId: user?.id || 'test-user',
        title: 'Project Planning',
        description: 'Strategic planning for Q4 projects',
        isPublic: false,
        nodes: [],
        connections: [],
        createdAt: new Date('2024-09-15').toISOString(),
        updatedAt: new Date('2024-09-18').toISOString(),
      },
      {
        id: '2',
        userId: user?.id || 'test-user',
        title: 'Study Notes - Biology',
        description: 'Cell biology and genetics overview',
        isPublic: true,
        nodes: [],
        connections: [],
        createdAt: new Date('2024-09-10').toISOString(),
        updatedAt: new Date('2024-09-19').toISOString(),
      },
      {
        id: '3',
        userId: user?.id || 'test-user',
        title: 'Meeting Ideas',
        description: 'Brainstorming session for team meeting',
        isPublic: false,
        nodes: [],
        connections: [],
        createdAt: new Date('2024-09-05').toISOString(),
        updatedAt: new Date('2024-09-17').toISOString(),
      },
      {
        id: '4',
        userId: user?.id || 'test-user',
        title: 'Research Topics',
        description: 'Literature review and research directions',
        isPublic: true,
        nodes: [],
        connections: [],
        createdAt: new Date('2024-09-01').toISOString(),
        updatedAt: new Date('2024-09-16').toISOString(),
      },
    ];
  }, [mindmaps, user?.id]);

  const allMindmaps = generateSampleMindmaps();

  // Calculate dashboard statistics
  const stats: DashboardStats = {
    totalMindmaps: allMindmaps.length,
    publicMindmaps: allMindmaps.filter(m => m.isPublic).length,
    recentActivity: allMindmaps.filter(m => {
      const updated = new Date(m.updatedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return updated > weekAgo;
    }).length,
    collaborations: 0, // TODO: Implement collaboration count
  };

  // Filter and sort mindmaps
  const filteredMindmaps = allMindmaps
    .filter(mindmap => {
      // Text search
      const matchesSearch = mindmap.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           mindmap.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by type
      const matchesFilter = filterBy === 'all' || 
                           (filterBy === 'public' && mindmap.isPublic) ||
                           (filterBy === 'private' && !mindmap.isPublic) ||
                           (filterBy === 'shared' && false); // TODO: Implement shared logic
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'activity':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

  // Handle create mindmap
  const handleCreateMindmap = async () => {
    if (!newMindmapData.title.trim()) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please enter a title for your mind map',
        duration: 3000,
      }));
      return;
    }

    try {
      const result = await dispatch(createMindmap(newMindmapData));
      if (createMindmap.fulfilled.match(result)) {
        setShowCreateForm(false);
        setNewMindmapData({ title: '', description: '', isPublic: false });
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Mind map created successfully',
          duration: 3000,
        }));
        navigate(`/mindmap/${result.payload.id}`);
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create mind map',
        duration: 3000,
      }));
    }
  };

  // Handle delete mindmap
  const handleDeleteMindmap = async (id: string) => {
    try {
      await dispatch(deleteMindmap(id));
      setShowDeleteConfirm(null);
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Mind map deleted successfully',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete mind map',
        duration: 3000,
      }));
    }
  };

  // Handle duplicate mindmap
  const handleDuplicateMindmap = async (mindmap: Mindmap) => {
    const duplicateData: CreateMindmapRequest = {
      title: `${mindmap.title} (Copy)`,
      description: mindmap.description,
      isPublic: false,
    };

    try {
      const result = await dispatch(createMindmap(duplicateData));
      if (createMindmap.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Mind map duplicated successfully',
          duration: 3000,
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to duplicate mind map',
        duration: 3000,
      }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading && allMindmaps.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading your mind maps...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Organize your thoughts and ideas with powerful mind mapping tools.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Squares2X2Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Mind Maps</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalMindmaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <ShareIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Public</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publicMindmaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentActivity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Collaborations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.collaborations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search mind maps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
              >
                <option value="all">All Mind Maps</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="shared">Shared</option>
              </select>
              <FunnelIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="activity">Sort by Activity</option>
              </select>
            </div>
          </div>

          {/* View Options and Create Button */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l ${viewMode === 'list' 
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                title="List view"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Create Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Mind Map
            </button>
          </div>
        </div>
      </div>

      {/* Mind Maps Grid/List */}
      {filteredMindmaps.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto max-w-md">
            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
              <Squares2X2Icon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No mind maps found' : 'No mind maps yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first mind map to get started organizing your ideas.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Mind Map
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredMindmaps.map((mindmap) => (
            <div
              key={mindmap.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'p-4' : 'p-6'
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  {/* Grid View */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {mindmap.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {mindmap.description || 'No description'}
                      </p>
                    </div>
                    <div className="ml-2 flex items-center space-x-1">
                      {mindmap.isPublic && (
                        <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <ShareIcon className="h-3 w-3 text-green-600 dark:text-green-400" />
                        </div>
                      )}
                      <div className="relative">
                        <button
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement dropdown menu
                          }}
                        >
                          <EllipsisVerticalIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>Updated {formatDate(mindmap.updatedAt)}</span>
                    <span className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(mindmap.createdAt)}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/mindmap/${mindmap.id}`)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicateMindmap(mindmap)}
                      className="px-3 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Duplicate"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(mindmap.id)}
                      className="px-3 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 text-sm font-medium rounded-md hover:bg-red-100 dark:hover:bg-red-900/40"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* List View */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          {mindmap.title}
                        </h3>
                        {mindmap.isPublic && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {mindmap.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>Created {formatDate(mindmap.createdAt)}</span>
                        <span>Updated {formatDate(mindmap.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/mindmap/${mindmap.id}`)}
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateMindmap(mindmap)}
                        className="p-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(mindmap.id)}
                        className="p-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Mindmap Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create New Mind Map
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newMindmapData.title}
                  onChange={(e) => setNewMindmapData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Enter mind map title..."
                  autoFocus
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newMindmapData.description}
                  onChange={(e) => setNewMindmapData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newMindmapData.isPublic}
                  onChange={(e) => setNewMindmapData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Make this mind map public
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={handleCreateMindmap}
                disabled={!newMindmapData.title.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Mind Map
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewMindmapData({ title: '', description: '', isPublic: false });
                }}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Mind Map
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this mind map? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDeleteMindmap(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
