import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import { Chat } from "./models/ChatModel.js";
import { isAuth } from "./middlewares/isAuth.js";
import { User } from "./models/userModel.js";
import { app, server } from "./socket/socket.js";
import path from "path";
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory (only if .env exists)
// On Render, env vars come from dashboard, not from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: false });

console.log("Environment check - TMDB_API_KEY exists:", !!process.env.TMDB_API_KEY);
console.log("Environment check - MONGO_URI exists:", !!process.env.MONGO_URI);

const url = `https://mern-social-idx8.onrender.com`;
const interval = 30000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log(
        `Reloaded at ${new Date().toISOString()}: Status Code ${
          response.status
        }`
      );
    })
    .catch((error) => {
      console.error(
        `Error reloading at ${new Date().toISOString()}:`,
        error.message
      );
    });
}

setInterval(reloadWebsite, interval);

cloudinary.v2.config({
  cloud_name: process.env.Cloudinary_Cloud_Name,
  api_key: process.env.Cloudinary_Api,
  api_secret: process.env.Cloudinary_Secret,
});

//using middlewares
app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 3000;

// to get all chats of user
app.get("/api/messages/chats", isAuth, async (req, res) => {
  try {
    const chats = await Chat.find({
      users: req.user._id,
    }).populate({
      path: "users",
      select: "name profilePic",
    });

    chats.forEach((e) => {
      e.users = e.users.filter(
        (user) => user._id.toString() !== req.user._id.toString()
      );
    });

    res.json(chats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// to get all users
app.get("/api/user/all", isAuth, async (req, res) => {
  try {
    const search = req.query.search || "";
    const users = await User.find({
      name: {
        $regex: search,
        $options: "i",
      },
      _id: { $ne: req.user._id },
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// importing routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import movieRoutes from "./routes/movieRoutes.js";
import roleProfileRoutes from "./routes/roleProfileRoutes.js";

//using routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/profile", roleProfileRoutes);

const rootDir = path.resolve(__dirname, "..");

// Determine the correct frontend dist path
// __dirname is backend folder, .. goes to root, then frontend/dist
const frontendDistPath = path.join(rootDir, "frontend", "dist");

console.log("Frontend dist path:", frontendDistPath);

// Serve static files from dist folder
app.use(express.static(frontendDistPath));

// Catch-all route for SPA (must be after all API routes)
// This handles React Router navigation
app.get("*", (req, res) => {
  const indexPath = path.join(frontendDistPath, "index.html");
  console.log("Serving index.html from:", indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Error loading app");
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
