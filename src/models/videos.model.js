import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema(
  {
    videofile: {
      type: String,
      required: true,
    },
    videofileId: {
      type: String
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailId: {
      type: String
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublised: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users"
    },
  },
  {
    timestamps: true,
  }
);

export const Videos = mongoose.model("Videos", videoSchema);
