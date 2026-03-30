import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { Users } from "../models/users.model.js";

const jwtverify = AsyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header["Authorization"]?.replace("Bearer ", "");

  let decoded;  

  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "AccessToken expired");
    }
    throw new ApiError("400", "Invalid AccessToken");
  }

  const user = await Users.findById(decoded.id);
  req.user = user;
  next();
});

export { jwtverify };
