import express from "express";
import routes from "../routes";
import {
  postRegisterView,
  postAddComment
} from "../controllers/videoController";
import { postAddLikey, python_runner } from "../controllers/userController";

const apiRouter = express.Router();
apiRouter.post(routes.registerView, postRegisterView);
apiRouter.post(routes.addComment, postAddComment);
apiRouter.post(routes.addLikey, postAddLikey);

export default apiRouter;
