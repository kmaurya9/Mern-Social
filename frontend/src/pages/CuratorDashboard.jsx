import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserData } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const CuratorDashboard = () => {
  const { user, isAuth } = UserData();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch lists on component mount
  useEffect(() => {
    if (isAuth && user?.role === 'curator') {
      fetchLists();
    }
  }, [isAuth, user]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/profile/curator/list/all');
      setLists(data.lists || []);
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Failed to load lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) {
      toast.error('List name required');
      return;
    }

    try {
      const { data } = await axios.post('/api/profile/curator/list/create', {
        listName: newListName,
        description: newListDesc,
      });
      setLists([...lists, data.list]);
      setNewListName('');
      setNewListDesc('');
      toast.success('List created successfully!');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Failed to create list');
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      await axios.delete(`/api/profile/curator/list/${listId}`);
      setLists(lists.filter(list => list.listId !== listId));
      toast.success('List deleted successfully!');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20 pb-20 px-4">
      {!isAuth || user?.role !== 'curator' ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-700 mb-6">Only Curators can access this page.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Curator Dashboard</h1>
                <p className="text-gray-600">Welcome, {user.name}!</p>
              </div>
            </div>
          </div>

          {/* Create List Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Create a New List</h2>
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g., Best Sci-Fi Movies 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Describe what makes this list special..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Create List
              </button>
            </form>
          </div>

          {/* Lists Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Lists</h2>
            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">Loading your lists...</p>
              </div>
            ) : lists.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">No lists created yet. Start by creating your first list!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lists.map((list) => (
                  <div key={list.listId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{list.listName}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{list.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{list.movies?.length || 0} movies</span>
                      <div className="space-x-2">
                        <button 
                          onClick={() => handleDeleteList(list.listId)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm"
                        >
                          Delete
                        </button>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curator Features Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-bold text-blue-900 mb-3">Curator Features</h3>
            <ul className="space-y-2 text-blue-800">
              <li>✓ Create and manage custom movie lists</li>
              <li>✓ Add personal recommendations</li>
              <li>✓ Organize movies by genre, mood, or theme</li>
              <li>✓ Share curated lists with followers</li>
              <li>✓ Write detailed list descriptions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuratorDashboard;
