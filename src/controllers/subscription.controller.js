import { Users } from "../models/users.model.js";
import { Subscriptions } from "../models/subscriptions.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const toggleSubscribeChannel = AsyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = req.user;

  if (!username)     throw new ApiError(400, "username not found!");
  if (!user)         throw new ApiError(400, "Unauthorized!");

  const channel = await Users.findOne({ username });

  if (!channel) throw new ApiError(400, "Channel not found!");

  if (channel.username === user.username)
    throw new ApiError(400, "User cannot subscribe himself!");

  const isSubscribe = await Subscriptions.findOneAndDelete({
    subscriber: user._id,
    channel: channel._id,
  });

  if (isSubscribe)
    return res
      .status(200)
      .json(
        new ApiResponse(200, "UnSubscribe channel successfully", isSubscribe)
      );

  const subscribe = await Subscriptions.create({
    subscriber: user._id,
    channel: channel._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Subscribe channel successfully!", subscribe));
});

export { toggleSubscribeChannel };
