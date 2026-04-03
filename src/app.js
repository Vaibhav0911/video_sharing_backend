import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import User from "./routes/user.route.js";
import Video from "./routes/video.route.js"

const app = express();

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

app.use("/api/v1/user", User);
app.use("/api/v1/video", Video);


export {app};