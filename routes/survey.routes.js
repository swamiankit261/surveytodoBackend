import { Router } from 'express';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createSurvey, getAllSurveys, searchSurveys, surveyQuestionTypeImage } from '../controllers/survey.controller.js';

const router = Router();

router.route("/createSurvey").post(verifyJWT, createSurvey);
router.route("/updateQuestionOptions").put(verifyJWT, upload.fields([
    { name: "imageA", maxCount: 1 },
    { name: "imageB", maxCount: 1 },
    { name: "imageC", maxCount: 1 },
    { name: "imageD", maxCount: 1 },
]), surveyQuestionTypeImage);

router.route("/getAllSurveys").get(getAllSurveys);
router.route("/searchSurveys").get(searchSurveys);


export default router;