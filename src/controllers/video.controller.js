import { Users } from "../models/users.model.js";
import { Videos } from "../models/videos.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { cloudinary } from "../utils/uploadToCloudinary.js";
import fs from "fs/promises";

const uploadFileOnCloudinary = (localFilePath, fileType, folder) => {
  return cloudinary.uploader.upload(localFilePath, {
    resource_type: fileType,
    folder: folder,
  });
};

const deleteFileFromLocal = async (filePath) => {
  try {
    await fs.unlink(filePath);
    console.log("File deleted from Local Storage:");
  } catch (error) {
    console.log("Error deleting File from Local Storage: ", error);
  }
};

const uploadVideo = AsyncHandler(async (req, res) => {
  if (!req.user?._id) throw new Error("Unauthorized");

  const { title, description, isPublised } = req.body;

  if (!title || !description)
    throw new ApiError(400, "title and description is required!");

  const localVideoFilePath = req.files?.videofile?.[0]?.path || "";
  const localThumbnailPath = req.files?.thumbnail?.[0]?.path || "";

  console.log(req.files);

  if (!localVideoFilePath) throw new ApiError(400, "No videofile uploaded");
  if (!localThumbnailPath) throw new ApiError(400, "No Thumbnail uploaded");

  const VideoFile = await uploadFileOnCloudinary(
    localVideoFilePath,
    "video",
    "videos"
  );

  const Thumbnail = await uploadFileOnCloudinary(
    localThumbnailPath,
    "image",
    "thumbnails"
  );

  console.log(VideoFile);
  console.log(Thumbnail);

  deleteFileFromLocal(localVideoFilePath);
  deleteFileFromLocal(localThumbnailPath);

  const video = await Videos.create({
    videofile: VideoFile.secure_url,
    videofileId: VideoFile.public_id,
    thumbnail: Thumbnail.secure_url,
    thumbnailId: Thumbnail.public_id,
    title,
    description,
    duration: VideoFile.duration,
    isPublised: isPublised === "true",
    owner: req.user?._id,
  });

  const user = await Users.findByIdAndUpdate(
    req.user?._id,
    {
      $push: { myVideos: video._id },
    },
    { new: true }
  );

  res.status(200).json(new ApiResponse(200, "Video uploaded successfully", {video, user}));
});

export { uploadVideo };
