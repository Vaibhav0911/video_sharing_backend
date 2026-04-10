import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { Upload } from "../middlewares/upload.middleware.js";
import {
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/register").post(
  Upload.fields([
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
  ]),
  userRegister
);

router.route("/login").post(Upload.none(), userLogin);

router.route("/refresh-access-token").post(refreshAccessToken);

// secure routes
router.route("/logout").post(jwtverify, userLogout);

export default router 
