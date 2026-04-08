import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      index: true
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      index: true
    },
  },
  { timestamps: true }
);

export const Subscriptions = mongoose.model("Subscriptions", subscriptionSchema);
