import { Comments } from "../models/comments.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Videos } from "../models/videos.model.js";
import mongoose from "mongoose";

const addComment = AsyncHandler(async (req, res) => {
  
    const {videoId} = req.params;
    const {content} = req.body;
    
    if(!videoId)          throw new ApiError(400, "videoId not found!");

    const owner = req.user;
    const video = await Videos.findById( videoId );

    if(!video)            throw new ApiError(400, "video not found!");
    if(!owner)            throw new ApiError(400, "unauthorized!");

    const comment =  await Comments.create({
        video: video._id,
        owner: owner._id,
        content: content ? content: "",
    })

    res.status(200).json(new ApiResponse(200, "Comment is successfully created", comment));
});

const getAllComment = AsyncHandler(async (req, res) => {
  
    const {videoId} = req.params;

    if(!videoId)          throw new ApiError(400, "videoId not found!");

    const video = await Videos.findById(videoId);

    if(!video)            throw new ApiError(400, "video not found!"); 
    
    const comment = await Comments.aggregate([
       { 
        $match: { video: video._id }
       },
       {
        $lookup: {
            from: "users",
            localField: "owner",
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
        $addFields : {
           user: { $arrayElemAt: ["$user", 0] }   
        }
       },
       {
        $project : {
            user: 1,
            content: 1,
            createdAt: 1
        }
       }
    ]);

    if(comment.length === 0)        throw new ApiError(400, "No comment found!");
    
    res.status(200).json(new ApiResponse(200, "Fetch comment successfully", comment));
})

const deleteComment = AsyncHandler(async (req, res) => {

    const {commentId} = req.params;

    if(!commentId)          throw new ApiError(400, "commentId not found!");

    const isComment = await Comments.findByIdAndDelete(commentId);

    if(!isComment)          throw new ApiError(400, "comment not found!");

    res.status(200).json(new ApiResponse(200, "Comment deleted successfully", comment));
})

const editComment = AsyncHandler(async (req, res) => {

    const {commentId} = req.params;
    const editContent = req.body?.content;
    
    if(!commentId)          throw new ApiError(400, "commentId not found!");

    const isComment = await Comments.findById(commentId)

    if(!isComment)          throw new ApiError(400, "comment not found!");

    const comment = await Comments.findByIdAndUpdate(
        commentId,
        {
            $set: { content: editContent }
        },
        { new: true }
    )

    res.status(200).json(new ApiResponse(200, "Comment updated Successfully", comment));
})

export {addComment, deleteComment, editComment, getAllComment};