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
  
  // Edit list state
  const [editingList, setEditingList] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  
  // Add movie state
  const [selectedList, setSelectedList] = useState(null);
  const [movieSearch, setMovieSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

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

  // Edit list handlers
  const handleEditClick = (list) => {
    setEditingList(list.listId);
    setEditName(list.listName);
    setEditDesc(list.description);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/profile/curator/list/${editingList}`, {
        listName: editName,
        description: editDesc,
      });
      
      setLists(lists.map(list => 
        list.listId === editingList 
          ? { ...list, listName: editName, description: editDesc }
          : list
      ));
      
      setEditingList(null);
      setEditName('');
      setEditDesc('');
      toast.success('List updated successfully!');
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Failed to update list');
    }
  };

  const handleCancelEdit = () => {
    setEditingList(null);
    setEditName('');
    setEditDesc('');
  };

  // Add movie handlers
  const handleAddMovieClick = (list) => {
    setSelectedList(list);
    setMovieSearch('');
    setSearchResults([]);
  };

  const handleSearchMovies = async (e) => {
    const query = e.target.value;
    setMovieSearch(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await axios.get(`/api/movie/search?query=${query}`);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching movies:', error);
    }
  };

  const handleSelectMovie = async (movie) => {
    try {
      await axios.post(`/api/profile/curator/list/${selectedList.listId}/movie`, {
        movieId: movie.id,
        movieTitle: movie.title,
        moviePoster: movie.poster_path,
      });

      setLists(lists.map(list => 
        list.listId === selectedList.listId 
          ? {
              ...list,
              movies: [
                ...(list.movies || []),
                {
                  movieId: movie.id,
                  movieTitle: movie.title,
                  moviePoster: movie.poster_path,
                  addedAt: new Date(),
                }
              ]
            }
          : list
      ));

      setSelectedList({ ...selectedList, movies: [...(selectedList.movies || []), movie] });
      setMovieSearch('');
      setSearchResults([]);
      toast.success('Movie added to list!');
    } catch (error) {
      console.error('Error adding movie:', error);
      toast.error('Failed to add movie to list');
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      await axios.delete(`/api/profile/curator/list/${selectedList.listId}/movie/${movieId}`);
      
      setLists(lists.map(list => 
        list.listId === selectedList.listId 
          ? {
              ...list,
              movies: list.movies.filter(m => m.movieId !== movieId)
            }
          : list
      ));

      setSelectedList({
        ...selectedList,
        movies: selectedList.movies.filter(m => m.movieId !== movieId)
      });
      
      toast.success('Movie removed from list!');
    } catch (error) {
      console.error('Error removing movie:', error);
      toast.error('Failed to remove movie');
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
                    {editingList === list.listId ? (
                      // Edit mode
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <textarea
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={handleSaveEdit}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition"
                          >
                            Save
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{list.listName}</h3>
                        <p className="text-gray-600 mb-4 text-sm">{list.description}</p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-500">{list.movies?.length || 0} movies</span>
                        </div>
                        
                        {/* Movies in list */}
                        {list.movies && list.movies.length > 0 && (
                          <div className="mb-4 max-h-40 overflow-y-auto">
                            <p className="text-xs font-semibold text-gray-700 mb-2">Movies:</p>
                            <div className="space-y-1">
                              {list.movies.map((movie) => (
                                <div key={movie.movieId} className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs">
                                  <span className="truncate">{movie.movieTitle}</span>
                                  <button
                                    onClick={() => {
                                      setSelectedList(list);
                                      handleRemoveMovie(movie.movieId);
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => handleAddMovieClick(list)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition text-sm flex-1"
                          >
                            + Movie
                          </button>
                          <button 
                            onClick={() => handleEditClick(list)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm flex-1"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteList(list.listId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm flex-1"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Movie Modal */}
          {selectedList && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 flex flex-col">
                <h3 className="text-xl font-bold mb-4">Add Movie to &quot;{selectedList.listName}&quot;</h3>
                
                <input
                  type="text"
                  value={movieSearch}
                  onChange={handleSearchMovies}
                  placeholder="Search movies..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />

                <div className="flex-1 overflow-y-auto mb-4">
                  {searchResults.length > 0 ? (
                    <div className="space-y-2">
                      {searchResults.map((movie) => (
                        <button
                          key={movie.id}
                          onClick={() => handleSelectMovie(movie)}
                          className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded transition text-sm"
                        >
                          <p className="font-semibold text-gray-900">{movie.title}</p>
                          <p className="text-xs text-gray-600">{movie.release_date?.substring(0, 4)}</p>
                        </button>
                      ))}
                    </div>
                  ) : movieSearch.trim() ? (
                    <p className="text-center text-gray-500 text-sm">No movies found</p>
                  ) : (
                    <p className="text-center text-gray-500 text-sm">Type to search for movies</p>
                  )}
                </div>

                <button 
                  onClick={() => setSelectedList(null)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

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
