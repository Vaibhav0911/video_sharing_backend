import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { toggleLike, getLike } from "../controllers/like.controller.js";

const router = Router();

router.route("/:targetType/:targetId").post(
    jwtverify,
    toggleLike
)

router.route("/:targetType/:targetId").post(
    jwtverify,
    getLike
)

export default router;