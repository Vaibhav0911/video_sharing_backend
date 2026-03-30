import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinary } from "../utils/uploadToCloudinary.js";
import { Users } from "../models/users.model.js";
import fs from "fs/promises";
import jwt from "jsonwebtoken";

const options = {
  httpOnly: true,
  secure: false,
};

const deleteImageFromLocal = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log("Image deleted from Local Storage:");
  } catch (error) {
    console.log("Error deleting image from Local Storage: ", error);
  }
};

const generateRefreshAccessToken = async (user) => {
  let accessToken, refreshToken;

  try {
    accessToken = user.accessToken();
    refreshToken = user.refreshToken();
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Error generating tokens");
  }

  user.refreshtoken = refreshToken;
  await user.save();
  return { accessToken, refreshToken };
};

const userRegister = AsyncHandler(async (req, res) => {
  const { username, fullname, email, password } = req.body;

  if (!username || !fullname || !email || !password)
    throw new ApiError(400, "All field are required!");

  const user = await Users.findOne({
    $or: [{ username }, { email }],
  });

  if (user) throw new ApiError(400, "username or email is already registered");

  let profileImagePath = req.files?.profileimage?.[0].path;
  let coverImagePath = req.files?.coverimage?.[0].path;
  let profileimageUrl = "";
  let coverimageUrl = "";

  if (profileImagePath) {
    const profileimage = await cloudinary.uploader.upload(profileImagePath);
    deleteImageFromLocal(profileImagePath);
    profileimageUrl = profileimage.secure_url;
  }

  if (coverImagePath) {
    const coverimage = await cloudinary.uploader.upload(coverImagePath);
    deleteImageFromLocal(coverImagePath);
    coverimageUrl = coverimage.secure_url;
  }

  const registerUser = await Users.create({
    username,
    fullname,
    email,
    password,
    profileimage: profileimageUrl,
    coverimage: coverimageUrl,
  });

  const registeredUser = await Users.findById(registerUser._id).select(
    "-password -refreshtoken"
  );

  res
    .status(200)
    .json(new ApiResponse(200, "User Register Successfully", registeredUser));
});

const userLogin = AsyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username && !email)
    throw new ApiError(400, "Must required email or username!");

  if (!password) throw new ApiError(400, "Must required password!");

  const user = await Users.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) throw new ApiError(400, "Invalid Email or Username");

  if (!user.isPasswordCorrect(password))
    throw new ApiError(400, "Invalid password");

  const { accessToken, refreshToken } = await generateRefreshAccessToken(user);

  const loginUser = await Users.findById(user._id).select(
    "-password -refreshtoken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Successfully login", {
        loginUser,
        accessToken,
        refreshToken,
      })
    );
});

const userLogout = AsyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(400, "Unauthorized");

  const user = req.user;

  const logoutUser = await Users.findByIdAndUpdate(
    user._id,
    { $set: { refreshtoken: undefined } },
    { new: true }
  ).select("-password -refreshtoken");

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "Successfully logged out", logoutUser));
});

const refreshAccessToken = AsyncHandler(async (req, res) => {
  const oldRefreshToken =
    req.cookies?.refreshToken ||
    req.header["Authorization"]?.replace("Bearer ", "");

  if (!oldRefreshToken) throw new ApiError(400, "Please send RefreshToken!");

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Refresh token expired");
    }
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await Users.findById(decodedToken.id);

  const { accessToken, refreshToken } = await generateRefreshAccessToken(user);

  console.log(accessToken, refreshToken);

  const newUser = await Users.findById(user._id).select(
    "-password -refreshtoken"
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "RefreshAccessToken Successfully", {
        newUser,
        accessToken,
        refreshToken,
      })
    );
});

const updateProfileImage = AsyncHandler(async (req, res) => {
  
  const profileImageLocalPath = req.file.path;

  const profileImage = await cloudinary.uploader.upload(profileImageLocalPath);

  deleteImageFromLocal(profileImageLocalPath);

  const user = await Users.findByIdAndUpdate(
    req.user._id,
    { $set: { profileimage: profileImage.secure_url } },
    { new: true }
  ).select("-password -refreshtoken");

  res
    .status(200)
    .json(new ApiResponse(200, "Profile Image Updated Successfully", user));
});

const updateCoverImage = AsyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;

  const coverImage = await cloudinary.uploader.upload(coverImageLocalPath);

  deleteImageFromLocal(coverImageLocalPath);

  const user = await Users.findByIdAndUpdate(
    req.user._id,
    { $set: { coverimage: coverImage.secure_url } },
    { new: true }
  ).select("-password -refreshtoken");

  res
    .status(200)
    .json(new ApiResponse(200, "Cover Image Updated Successfully", user));
});

export {
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
  updateProfileImage,
  updateCoverImage,
};
