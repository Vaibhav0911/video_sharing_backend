import { Router } from "express";
import { Upload } from "../middlewares/upload.middleware.js";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { 
  updateProfileImage,
  updateCoverImage,
  getUserChannelProfile,
  userWatchHistory,
  getUserVideos,
} from "../controllers/user.controller.js";

const router = Router();

// secure routes
router.route("/update-profile-image").patch(
  jwtverify,
  Upload.single("profileimage"),
  updateProfileImage
)

router.route("/update-cover-image").patch(
  jwtverify,
  Upload.single("coverimage"),
  updateCoverImage
)

router.route("/channel-profile/:username").get(
  jwtverify,
  getUserChannelProfile
)

router.route("/watch-history").get(
  jwtverify,
  userWatchHistory
)

router.route("/:username/videos").get(
  jwtverify,
  getUserVideos
)

export default router;
