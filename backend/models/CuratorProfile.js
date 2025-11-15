import mongoose from "mongoose";

const curatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    curatedLists: [
      {
        listId: String,
        listName: String,
        description: String,
        movies: [
          {
            movieId: String,
            movieTitle: String,
            moviePoster: String,
            addedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    recommendations: [
      {
        movieId: String,
        reason: String,
        createdAt: Date,
      },
    ],
    expertise: [String],
    followersCount: {
      type: Number,
      default: 0,
    },
    listsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const CuratorProfile = mongoose.model("CuratorProfile", curatorProfileSchema);
