import TryCatch from "../utils/Trycatch.js";
import { ViewerProfile } from "../models/ViewerProfile.js";
import { CuratorProfile } from "../models/CuratorProfile.js";
import { AdminProfile } from "../models/AdminProfile.js";

export const createViewerProfile = TryCatch(async (req, res) => {
  const profile = await ViewerProfile.create({
    userId: req.user._id,
    watchlist: [],
    favoriteGenres: [],
    reviewsCount: 0,
    watchedMovies: [],
  });

  res.status(201).json({
    message: "Viewer profile created",
    profile,
  });
});

export const createCuratorProfile = TryCatch(async (req, res) => {
  const profile = await CuratorProfile.create({
    userId: req.user._id,
    curatedLists: [],
    recommendations: [],
    expertise: [],
    followersCount: 0,
    listsCount: 0,
  });

  res.status(201).json({
    message: "Curator profile created",
    profile,
  });
});

export const createAdminProfile = TryCatch(async (req, res) => {
  const profile = await AdminProfile.create({
    userId: req.user._id,
    permissions: ["view_reports", "moderate_content"],
    moderationLevel: "basic",
    lastLogin: new Date(),
    reportsHandled: 0,
    usersManaged: 0,
    suspendedUsers: [],
    activityLog: [],
  });

  res.status(201).json({
    message: "Admin profile created",
    profile,
  });
});

export const getViewerProfile = TryCatch(async (req, res) => {
  const profile = await ViewerProfile.findOne({
    userId: req.params.userId,
  }).populate("userId", "-password");

  if (!profile)
    return res.status(404).json({
      message: "Viewer profile not found",
    });

  res.json(profile);
});

export const getCuratorProfile = TryCatch(async (req, res) => {
  const profile = await CuratorProfile.findOne({
    userId: req.params.userId,
  }).populate("userId", "-password");

  if (!profile)
    return res.status(404).json({
      message: "Curator profile not found",
    });

  res.json(profile);
});

export const getAdminProfile = TryCatch(async (req, res) => {
  const profile = await AdminProfile.findOne({
    userId: req.params.userId,
  }).populate("userId", "-password");

  if (!profile)
    return res.status(404).json({
      message: "Admin profile not found",
    });

  res.json(profile);
});

export const addToWatchlist = TryCatch(async (req, res) => {
  const { movieId, movieTitle } = req.body;

  const profile = await ViewerProfile.findOne({
    userId: req.user._id,
  });

  if (!profile)
    return res.status(404).json({
      message: "Viewer profile not found",
    });

  profile.watchlist.push({
    movieId,
    movieTitle,
  });

  await profile.save();

  res.json({
    message: "Movie added to watchlist",
    profile,
  });
});

export const updateCuratorExpertise = TryCatch(async (req, res) => {
  const { expertise } = req.body;

  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile)
    return res.status(404).json({
      message: "Curator profile not found",
    });

  profile.expertise = expertise;
  await profile.save();

  res.json({
    message: "Expertise updated",
    profile,
  });
});

export const addAdminActivityLog = TryCatch(async (req, res) => {
  const { action, targetId } = req.body;

  const profile = await AdminProfile.findOne({
    userId: req.user._id,
  });

  if (!profile)
    return res.status(404).json({
      message: "Admin profile not found",
    });

  profile.activityLog.push({
    action,
    targetId,
    timestamp: new Date(),
  });

  profile.lastModeration = new Date();
  await profile.save();

  res.json({
    message: "Activity logged",
    profile,
  });
});

// Curator List Functions
export const createCuratorList = TryCatch(async (req, res) => {
  const { listName, description } = req.body;

  if (!listName || !listName.trim()) {
    return res.status(400).json({
      message: "List name is required",
    });
  }

  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Curator profile not found",
    });
  }

  const newList = {
    listId: new Date().getTime().toString(), // Simple unique ID
    listName: listName.trim(),
    description: description || "",
    movies: [],
    createdAt: new Date(),
  };

  profile.curatedLists.push(newList);
  profile.listsCount = profile.curatedLists.length;
  await profile.save();

  res.status(201).json({
    message: "List created successfully",
    list: newList,
    profile,
  });
});

export const getCuratorLists = TryCatch(async (req, res) => {
  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Curator profile not found",
    });
  }

  res.json({
    lists: profile.curatedLists || [],
    profile,
  });
});

export const deleteCuratorList = TryCatch(async (req, res) => {
  const { listId } = req.params;

  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Curator profile not found",
    });
  }

  const listIndex = profile.curatedLists.findIndex(
    (list) => list.listId === listId
  );

  if (listIndex === -1) {
    return res.status(404).json({
      message: "List not found",
    });
  }

  profile.curatedLists.splice(listIndex, 1);
  profile.listsCount = profile.curatedLists.length;
  await profile.save();

  res.json({
    message: "List deleted successfully",
    profile,
  });
});

export const updateCuratorList = TryCatch(async (req, res) => {
  const { listId } = req.params;
  const { listName, description, movies } = req.body;

  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Curator profile not found",
    });
  }

  const list = profile.curatedLists.find((l) => l.listId === listId);

  if (!list) {
    return res.status(404).json({
      message: "List not found",
    });
  }

  if (listName) list.listName = listName.trim();
  if (description !== undefined) list.description = description;
  if (movies) list.movies = movies;

  await profile.save();

  res.json({
    message: "List updated successfully",
    list,
    profile,
  });
});

export const addMovieToCuratorList = TryCatch(async (req, res) => {
  const { listId } = req.params;
  const { movieId, movieTitle, moviePoster } = req.body;

  if (!movieId || !movieTitle) {
    return res.status(400).json({
      message: "Movie ID and title are required",
    });
  }

  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Curator profile not found",
    });
  }

  const list = profile.curatedLists.find((l) => l.listId === listId);

  if (!list) {
    return res.status(404).json({
      message: "List not found",
    });
  }

  // Check if movie already exists in list
  const movieExists = list.movies.some((m) => m.movieId === movieId);
  if (movieExists) {
    return res.status(400).json({
      message: "Movie already in this list",
    });
  }

  list.movies.push({
    movieId,
    movieTitle,
    moviePoster: moviePoster || "",
    addedAt: new Date(),
  });

  await profile.save();

  res.json({
    message: "Movie added to list",
    list,
    profile,
  });
});

export const removeMovieFromCuratorList = TryCatch(async (req, res) => {
  const { listId, movieId } = req.params;

  const profile = await CuratorProfile.findOne({
    userId: req.user._id,
  });

  if (!profile) {
    return res.status(404).json({
      message: "Curator profile not found",
    });
  }

  const list = profile.curatedLists.find((l) => l.listId === listId);

  if (!list) {
    return res.status(404).json({
      message: "List not found",
    });
  }

  const movieIndex = list.movies.findIndex((m) => m.movieId === movieId);

  if (movieIndex === -1) {
    return res.status(404).json({
      message: "Movie not found in list",
    });
  }

  list.movies.splice(movieIndex, 1);
  await profile.save();

  res.json({
    message: "Movie removed from list",
    list,
    profile,
  });
});
