import Rating from "../models/feedbacks.model.js";
import Survey from "../models/survey.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


export const createFeedback = asyncHandler(async (req, res) => {
    const { whichSurvey, feddbackText, rating } = req.body;


    const validateInput = (condition, message, statusCode) => {
        if (!condition) throw new Apierror(statusCode ?? 400, message);
    };

    validateInput(whichSurvey && rating, "Please provide a valid survey ID and a rating.");
    validateInput(/^[0-9a-fA-F]{24}$/.test(whichSurvey), "Please provide a valid survey ID.");


    if (!req.user || !req.user._id) throw new Apierror(401, "Unauthorized: User information missing.");

    if (rating < 1 || rating > 5) throw new Apierror(400, "Rating must be between 1 and 5.");



    const feedbackExists = await Rating.findOne({ whichUser: req.user._id });

    const surveyExists = await Survey.findById(whichSurvey);
    if (!surveyExists) throw new Apierror(404, "Survey not found.!!");


    const feedback = {
        whichSurvey: whichSurvey,
        whichUser: req.user._id,
        rating: Number(rating)
    };

    if (feddbackText) {
        feedback.feddbackText = feddbackText;
    };

    var newFeedback;
    if (feedbackExists) {
        delete feedback.whichSurvey;
        delete feedback.whichUser;
        newFeedback = await Rating.findByIdAndUpdate(feedbackExists._id, feedback, { runValidators: true, new: true });
    } else {
        newFeedback = await Rating.create(feedback);
    }

    res.status(201).json(new ApiResponse(201, newFeedback, "Feedback created successfully.!"))
});



export const getOneFeedback = asyncHandler(async (req, res) => {
    const { feedbackId } = req.params;

    if (!feedbackId) throw new Apierror(400, "please provide feedback ID.!");
    if (!/^[0-9a-fA-F]{24}$/.test(feedbackId)) throw new Apierror(400, "please provide valid feedback ID.!");


    const feedback = await Rating.findById(feedbackId);

    if (!feedback) throw new Apierror(404, "Feedback not found.!");

    res.status(200).json(new ApiResponse(200, feedback, "Feedback fetched successfully.!"));
});