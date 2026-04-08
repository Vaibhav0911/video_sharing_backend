import { Users } from "../models/users.model.js";
import { Subscriptions } from "../models/subscriptions.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const subscribeToChannel = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = req.user;

  const channel = await Users.findOne({ username });

  if (!channel) throw new ApiError(400, "Channel not found!");
  if (!user) throw new ApiError(400, "Unauthorized!");

  // console.log(channel._id, user._id);

  if (channel.username === user.username)
    throw new ApiError(400, "User cannot subscribe himself!");

  const isSubscribe = await Subscriptions.findOne({
    subscriber: user._id,
    channel: channel._id,
  });

  if (isSubscribe)
    throw new ApiError(400, "User already subscribed the channel!");

  const subscribe = await Subscriptions.create({
    subscriber: user._id,
    channel: channel._id,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "User subscribe channel successfully!", subscribe)
    );
});

const unSubscribeFromChannel = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = req.user;

  const channel = await Users.findOne({ username });

  if (!channel) throw new ApiError(400, "Channel not found!");
  if (!user) throw new ApiError(400, "Unauthorized!");

  if (channel.username === user.username)
    throw new ApiError(400, "User cannot unSubscribe himself!");

  const isSubscribe = await Subscriptions.findOne({
    subscriber: user._id,
    channel: channel._id,
  });

  if (!isSubscribe)
    throw new ApiError(400, "User already not subscribed the channel!");

  const subscribe = await Subscriptions.deleteOne({
    subscriber: user._id,
    channel: channel._id,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "User unsubscribe channel successfully!", subscribe)
    );
});

export { subscribeToChannel, unSubscribeFromChannel };
