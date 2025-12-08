import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MovieData } from "../context/MovieContext";
import { UserData } from "../context/UserContext";
import { Loading } from "../components/Loading";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const {
    selectedMovie,
    reviews,
    loading,
    getMovieDetails,
    getMovieReviews,
    addMovieReview,
    deleteMovieReview,
  } = MovieData();

  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    getMovieDetails(id);
    getMovieReviews(id);
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuth) {
      toast.error("Please login to add a review");
      navigate("/login");
      return;
    }

    const reviewData = {
      movieId: id,
      movieTitle: selectedMovie.title,
      rating: rating,
      review: review,
      moviePoster: selectedMovie.poster_path
        ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
        : "",
    };

    const result = await addMovieReview(reviewData);
    if (result) {
      setReview("");
      setRating(5);
      setShowReviewForm(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteMovieReview(reviewId, id);
    }
  };

  if (loading) return <Loading />;

  if (!selectedMovie) return <div>Movie not found</div>;

  const imageUrl = selectedMovie.poster_path
    ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
    : "/placeholder-movie.png";

  const backdropUrl = selectedMovie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${selectedMovie.backdrop_path}`
    : null;

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
            <span className="text-gray-400">›</span>
            <Link to="/search" className="text-blue-600 hover:text-blue-800">Search</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-600">{selectedMovie?.title}</span>
          </nav>
        </div>
      </div>
      
      {/* Movie Header */}
      {backdropUrl && (
        <div
          className="w-full h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 relative z-10 pt-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={imageUrl}
              alt={selectedMovie.title}
              className="w-64 h-96 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-2">{selectedMovie.title}</h1>
            {selectedMovie.tagline && (
              <p className="text-gray-600 italic mb-4">
                {selectedMovie.tagline}
              </p>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="font-semibold">
                  {selectedMovie.vote_average?.toFixed(1)}/10
                </span>
              </div>
              <span className="text-gray-600">
                {selectedMovie.release_date?.split("-")[0]}
              </span>
              <span className="text-gray-600">
                {selectedMovie.runtime} min
              </span>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Genres:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMovie.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Overview:</h3>
              <p className="text-gray-700">{selectedMovie.overview}</p>
            </div>

            {selectedMovie.credits?.cast && (
              <div>
                <h3 className="font-semibold mb-2">Cast:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMovie.credits.cast.slice(0, 5).map((actor) => (
                    <span
                      key={actor.id}
                      className="text-gray-600 text-sm"
                    >
                      {actor.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-2xl font-bold">User Reviews</h2>
            {isAuth && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors min-w-44"
              >
                {showReviewForm ? "Cancel" : "Write a Review"}
              </button>
            )}
            {!isAuth && (
              <Link
                to="/login"
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors min-w-44 text-center"
              >
                Login to Review
              </Link>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Rating:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`text-2xl cursor-pointer ${
                        star <= rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Review:</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  placeholder="Write your review..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
              >
                Submit Review
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev._id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      {isAuth ? (
                        <Link to={`/profile/${rev.user._id}`}>
                          <img
                            src={rev.user.profilePic?.url}
                            alt={rev.user.name}
                            className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80"
                          />
                        </Link>
                      ) : (
                        <img
                          src={rev.user.profilePic?.url}
                          alt={rev.user.name}
                          className="w-10 h-10 rounded-full opacity-60"
                        />
                      )}
                      <div>
                        {isAuth ? (
                          <Link
                            to={`/profile/${rev.user._id}`}
                            className="font-semibold hover:text-blue-500"
                          >
                            {rev.user.name}
                          </Link>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-gray-600">
                              {rev.user.name}
                            </span>
                            <button
                              onClick={() => window.location.href = '/login'}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Login to View Profile
                            </button>
                          </div>
                        )}
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-sm ${
                                i < rev.rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {isAuth && user && user._id === rev.user._id && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700">{rev.review}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
