import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import AddPost from "../components/AddPost";
import PostCard from "../components/PostCard";
import { PostData } from "../context/PostContext";
import { UserData } from "../context/UserContext";
import { Loading } from "../components/Loading";
import Footer from "../components/Footer";

const Home = () => {
  const { posts, loading } = PostData();
  const { isAuth, user, loading: userLoading } = UserData();

  // For logged-in users, show only their posts and posts from people they follow
  const sortedPosts = useMemo(() => {
    let result = posts;
    if (isAuth && user && posts && !userLoading) {
      const userPosts = posts.filter((post) => post.owner._id === user._id);
      const followingPosts = posts.filter(
        (post) => post.owner._id !== user._id && user.followings?.includes(post.owner._id)
      );
      result = [...userPosts, ...followingPosts];
    }
    return result;
  }, [isAuth, user, posts, userLoading]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className={`min-h-screen pb-24 ${!isAuth ? 'pt-20' : 'pt-16'}`}>
          {/* Hero Section for Anonymous Users */}
          {!isAuth && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 px-4 text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Mern Social</h1>
              <p className="text-xl mb-6">
                Connect, Share, and Discover Movies with Friends
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Logged-in User Actions */}
          {isAuth && (
            <div className="mb-4 mt-2">
              <AddPost type="post" />
            </div>
          )}

          {/* Posts Feed */}
          <div className="max-w-2xl mx-auto">
            {isAuth && user && (
              <h2 className="text-2xl font-bold mb-4 px-4 text-center">Your Feed</h2>
            )}
            {!isAuth && (
              <h2 className="text-2xl font-bold mb-4 px-4 mt-6 text-center">Recent Posts</h2>
            )}
            
            {sortedPosts && sortedPosts.length > 0 ? (
              sortedPosts.map((e) => <PostCard value={e} key={e._id} type={"post"} />)
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-gray-500 mb-4">No posts from people you follow yet</p>
                {isAuth && (
                  <>
                    <p className="text-sm text-gray-400 mb-6">
                      Follow more users to see their posts, or create your own!
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <h3 className="font-semibold text-gray-700 mb-3">Quick Tips:</h3>
                      <ul className="text-left text-sm text-gray-600 space-y-2">
                        <li>✓ Share your thoughts on movies</li>
                        <li>✓ Connect with other movie lovers</li>
                        <li>✓ Explore new films and recommendations</li>
                        <li>✓ Join the conversation!</li>
                      </ul>
                    </div>
                  </>
                )}
                {!isAuth && (
                  <p className="text-sm text-gray-400">
                    <Link to="/register" className="text-blue-500 hover:underline">
                      Sign up
                    </Link>{" "}
                    to start sharing!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Call to Action for Anonymous Users */}
          {!isAuth && posts && posts.length > 0 && (
            <div className="bg-gray-100 py-8 px-4 text-center mt-8 mb-32">
              <h3 className="text-2xl font-bold mb-2">Want to join the conversation?</h3>
              <p className="text-gray-600 mb-4">
                Sign up to like, comment, and share posts!
              </p>
              <Link
                to="/register"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600"
              >
                Create Account
              </Link>
            </div>
          )}
          
          <Footer />
        </div>
      )}
    </>
  );
};

export default Home;
