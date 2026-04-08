import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import {
  subscribeToChannel,
  unSubscribeFromChannel,
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/user/:username").post(
    jwtverify,
    subscribeToChannel
)

router.route("/user/:username").delete(
    jwtverify,
    unSubscribeFromChannel
)

export default router;