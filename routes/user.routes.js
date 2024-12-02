import { Router } from 'express';
import { loginUser, registerUser, surveyCategory } from '../controllers/user.controller.js';
import {verifyJWT}  from '../middlewares/auth.middlewares.js';

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").get(loginUser);
router.route("/mySurvey").put(verifyJWT, surveyCategory);

export default router;