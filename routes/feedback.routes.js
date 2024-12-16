import express from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { createFeedback, getOneFeedback } from "../controllers/feedback.controller.js";

const route = express.Router();

route.route("/createFeedback").post(verifyJWT, createFeedback);
route.route("/getFeedback/:feedbackId").get(verifyJWT, getOneFeedback);


export default route;