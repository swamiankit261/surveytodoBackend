import { Router } from 'express';
import {
    loginUser, logoutUser, refreshUserAccessToken,
    registerUser, surveyCategory, updateAvatar, updateUserDetails
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { getSurveyByCategory } from '../controllers/survey.controller.js';

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").put(loginUser);
router.route("/mySurvey").put(verifyJWT, surveyCategory);
router.route("/logoutUser").get(verifyJWT, logoutUser);
router.route('/updateUserDetails').patch(verifyJWT, updateUserDetails);
router.route('/updateAvatar').patch(verifyJWT, updateAvatar);
router.route('/refreshUserAccessToken').get(refreshUserAccessToken);
router.route('/getSurveyByCategory').get(verifyJWT, getSurveyByCategory);

export default router;