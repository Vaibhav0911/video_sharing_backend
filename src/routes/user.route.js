import { Router } from "express";
import { Upload } from "../middlewares/upload.middleware.js";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { 
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
  updateProfileImage,
  updateCoverImage 
} from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
  Upload.fields([
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 2 },
  ]),
  userRegister
);

router.route("/login").post(
  Upload.none(),
  userLogin
)

router.route("/refresh-access-token").post(
  refreshAccessToken
)

// secure routes
router.route("/logout").post(
  jwtverify,
  userLogout
)

router.route("/update-profile-image").post(
  jwtverify,
  Upload.single("profileimage"),
  updateProfileImage
)

router.route("/update-cover-image").post(
  jwtverify,
  Upload.single("coverimage"),
  updateCoverImage
)

export default router;
