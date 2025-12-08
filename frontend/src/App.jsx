import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserData } from "./context/UserContext";
import Account from "./pages/Account";
import NavigationBar from "./components/NavigationBar";
import PublicNav from "./components/PublicNav";
import NotFound from "./components/NotFound";
import { Loading } from "./components/Loading";
import UserAccount from "./pages/UserAccount";
import Search from "./pages/Search";
import ChatPage from "./pages/ChatPage";
import MovieDetails from "./pages/MovieDetails";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import CuratorDashboard from "./pages/CuratorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  const { loading, isAuth, user } = UserData();

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <BrowserRouter>
          {/* Show public nav for anonymous users, bottom nav for logged-in users */}
          {!isAuth && <PublicNav />}
          
          <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={isAuth ? <Home /> : <About />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/details/:id" element={<MovieDetails />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Auth routes */}
            <Route path="/login" element={!isAuth ? <Login /> : <About />} />
            <Route
              path="/register"
              element={!isAuth ? <Register /> : <About />}
            />
            
            {/* Protected routes - require login */}
            <Route
              path="/profile"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route
              path="/profile/:id"
              element={<UserAccount user={user} />}
            />
            <Route path="/chat" element={isAuth ? <ChatPage user={user} /> : <Login />} />
            
            {/* Role-based routes */}
            <Route path="/curator" element={isAuth ? <CuratorDashboard /> : <Login />} />
            <Route path="/admin" element={isAuth ? <AdminDashboard /> : <Login />} />
            
            {/* Legacy route - redirect for backwards compatibility */}
            <Route
              path="/account"
              element={isAuth ? <Account user={user} /> : <Login />}
            />
            <Route
              path="/user/:id"
              element={<UserAccount user={user} />}
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          {isAuth && <NavigationBar />}
        </BrowserRouter>
      )}
    </>
  );
};

export default App;
