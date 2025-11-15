import TryCatch from "../utils/Trycatch.js";
import { User } from "../models/userModel.js";
import { Follow } from "../models/FollowModel.js";
import getDataUrl from "../utils/urlGenrator.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json(user);
});

export const userProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user)
    return res.status(404).json({
      message: "No User with is id",
    });

  res.json(user);
});

export const followandUnfollowUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  const loggedInUser = await User.findById(req.user._id);

  if (!user)
    return res.status(404).json({
      message: "No User with is id",
    });

  if (user._id.toString() === loggedInUser._id.toString())
    return res.status(400).json({
      message: "You can't follow yourself",
    });

  if (user.followers.includes(loggedInUser._id)) {
    // Unfollow - remove from both User arrays and Follow model
    const indexFollowing = loggedInUser.followings.indexOf(user._id);
    const indexFollower = user.followers.indexOf(loggedInUser._id);

    loggedInUser.followings.splice(indexFollowing, 1);
    user.followers.splice(indexFollower, 1);

    await loggedInUser.save();
    await user.save();

    // Also remove from Follow model
    await Follow.deleteOne({
      follower: loggedInUser._id,
      following: user._id,
    });

    res.json({
      message: "User Unfollowed",
    });
  } else {
    // Follow - add to both User arrays and Follow model
    loggedInUser.followings.push(user._id);
    user.followers.push(loggedInUser._id);

    await loggedInUser.save();
    await user.save();

    // Also create in Follow model
    await Follow.create({
      follower: loggedInUser._id,
      following: user._id,
    });

    res.json({
      message: "User Followed",
    });
  }
});

export const userFollowerandFollowingData = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "-password")
    .populate("followings", "-password");

  const followers = user.followers;
  const followings = user.followings;

  res.json({
    followers,
    followings,
  });
});

export const updateProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { name } = req.body;

  if (name) {
    user.name = name;
  }

  const file = req.file;
  if (file) {
    const fileUrl = getDataUrl(file);

    await cloudinary.v2.uploader.destroy(user.profilePic.id);

    const myCloud = await cloudinary.v2.uploader.upload(fileUrl.content);

    user.profilePic.id = myCloud.public_id;
    user.profilePic.url = myCloud.secure_url;
  }

  await user.save();

  res.json({
    message: "Profile updated",
  });
});

export const updatePassword = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { oldPassword, newPassword } = req.body;

  const comparePassword = await bcrypt.compare(oldPassword, user.password);

  if (!comparePassword)
    return res.status(400).json({
      message: "Wrong old password",
    });

  user.password = await bcrypt.hash(newPassword, 10);

  await user.save();

  res.json({
    message: "Password Updated",
  });
});

export const getAllUsers = TryCatch(async (req, res) => {
  const { search } = req.query;
  
  let query = {};
  if (search) {
    // Search by name or email
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };
  }
  
  const users = await User.find(query).select("-password");
  res.json(users);
});

export const updateUserRole = TryCatch(async (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  const validRoles = ['viewer', 'curator', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");

  res.json({
    message: "Role updated successfully",
    user,
  });
});

export const deleteUser = TryCatch(async (req, res) => {
  const userId = req.params.id;
  const currentUserId = req.user._id;

  // Prevent admin from deleting themselves
  if (userId === currentUserId.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User deleted successfully",
    deletedUser: user.name,
  });
});
