import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import User from "./routes/user.route.js";
import Video from "./routes/video.route.js";
import Subscription from "./routes/subscription.route.js";
import Comment from "./routes/comment.route.js";
import Like from "./routes/like.route.js";

const app = express();

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

app.use("/api/v1/user", User);
app.use("/api/v1/video", Video);
app.use("/api/v1/subscription", Subscription);
app.use("/api/v1/comment", Comment);
app.use("/api/v1/like", Like);


export {app};