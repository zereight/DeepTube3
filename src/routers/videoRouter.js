import express from "express";
import routes from "../routes";
import {
  getUpload,
  postUpload,
  videoDetail,
  deleteVideo,
  getEditVideo,
  postEditVideo,
  python_runner,
  local_video_downloader
} from "../controllers/videoController";
import { uploadVideo, onlyPrivate, localsMiddleware } from "../middlewares";

const videoRouter = express.Router();

// Upload
videoRouter.get(routes.upload, onlyPrivate, getUpload);
videoRouter.post(routes.upload, onlyPrivate, uploadVideo, postUpload);

// Video Detail
videoRouter.get(routes.videoDetail(),videoDetail);

// Edit Video
videoRouter.get(routes.editVideo(), onlyPrivate, getEditVideo);
videoRouter.post(routes.editVideo(), onlyPrivate, postEditVideo);

// Delete Video
videoRouter.post(routes.deleteVideo(), onlyPrivate, deleteVideo);

// Convert Video
videoRouter.post(routes.converter(), onlyPrivate, python_runner);

// Video Download
videoRouter.get(routes.videoDownload(), onlyPrivate, local_video_downloader);

export default videoRouter;
