import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Likes } from "../models/likes.model.js";

const allowedTypes = ["Videos", "Comments", "Tweets"];

const toggleLike = AsyncHandler(async (req, res) => {
  const {targetId, targetType} = req.params;
  const user = req.user;
  
  if (!allowedTypes.includes(targetType))     throw new ApiError(400, "Invalid targetType");  
  if (!targetId)                              throw new ApiError(400, "targetId not found!");
  if (!user)                                  throw new ApiError(400, "Unauthorized");

  const like = await Likes.findOneAndDelete({
    likeBy: user._id,
    targetType: targetType,
    targetId: targetId,
  });

  if (like) {
    return res.status(200).json(new ApiResponse(200, "unlike successfully", like));
  }

  const result = await Likes.create({
    likeBy: user._id,
    targetType: targetType,
    targetId: targetId
  })

  return res.status(200).json(new ApiResponse(200, "like successfully", result));
});

const getLike = AsyncHandler(async (req, res) => {
  
    const {targetId, targetType} = req.params;
    const user = req.body;

    if (!allowedTypes.includes(targetType))     throw new ApiError(400, "Invalid targetType");  
    if (!targetId)                              throw new ApiError(400, "targetId not found!");
    if (!user)                                  throw new ApiError(400, "Unauthorized");

    const likeCount = await Likes.countDocuments({
        targetType: targetType,
        targetId: targetId
    })

    const likes = await Likes.aggregate([
        {
            $match: {
                targetType: targetType,
                targetId: targetId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "likeBy",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            profileimage: 1,
                            username: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                username: { $arrayElemAt: ["$user.username", 0] },
                profileimage: { $arrayElemAt: ["$user.profileimage", 0] }
            }
        },
        {
            $project: {
                username: 1,
                profileimage: 1,
                createdAt: 1
            }
        }
    ]) 

    return res.status(200).json(new ApiResponse(200, "Likes fetch successfully", {likeCount, likes}));
})

export {toggleLike, getLike};