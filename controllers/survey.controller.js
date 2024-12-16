import asyncHandler from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apiError.js";
import Survey from "../models/survey.models.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createSurvey = asyncHandler(async (req, res) => {
    const { title, category, questions, publishStatus, scheduledPublishDate } = req.body;

    // Validate required fields
    const isValid = [title, category, publishStatus].every(
        (item) => item !== null && item !== undefined && item !== ""
    );

    if (!isValid) throw new Apierror(400, "Please fill out all the required fields!!");

    if (!questions?.length) throw new Apierror(400, "Please give questions.!!");
    // Parse questions if necessary
    const parsedQuestions = Array.isArray(questions) ? questions : JSON.parse(questions);

    // Validate questions array
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Apierror(400, "At least one question is required!");
    }

    parsedQuestions.forEach((question, index) => {
        const { questionText, questionType, ansType, ansOptions } = question;

        // Validate each question's fields
        const isQuestionValid = [questionText, questionType, ansType].every(
            (item) => item !== null && item !== undefined && item !== "" && (typeof item !== "string" || item.trim() !== "")
        );

        if (!isQuestionValid) {
            throw new Apierror(400, `Please fill out all the required fields for question #${index + 1}: "${questionText}"`);
        }

        if (["radio", "checkbox", "select"].includes(questionType)) {
            if (!ansOptions) throw new Apierror(400, `Please fill the ansOptions field.!!`);
        }

        if (questionType === "image") throw new Apierror(400, "This API does not take images in answers.!!");
        //     const images = req.files;

        //     images.forEach((image, i) => {
        //         const { path, filename } = image;
        //         question.ansOptions[i] = {
        //             path: path,
        //             filename: filename
        //         }
        //     })
        // };
    });



    // Create a new survey
    const survey = new Survey({
        title,
        category,
        questions: parsedQuestions,
        created_by: req.user._id,
        publishStatus,
    });

    if (publishStatus === "scheduled") {
        if (!scheduledPublishDate) throw new Apierror(400, `if publishStatus is ${publishStatus} PublishDate is required.!!`);
        // Check if scheduled publish date is in the past
        if (new Date(scheduledPublishDate) < new Date()) throw new Apierror(400, `Scheduled publish date ${new Date(scheduledPublishDate).toLocaleString()} cannot be in the past.!!`)
        survey.scheduledPublishDate = new Date(scheduledPublishDate);
    };


    await survey.save();

    res.status(201).json(new ApiResponse(201, survey, "Survey created successfully.!!"));
});


export const surveyQuestionTypeImage = asyncHandler(async (req, res) => {
    const questions = req.body.questions;
    const id = req.body.id;

    const parsedQuestions = Array.isArray(questions) ? questions : JSON.parse(questions);

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0 || parsedQuestions.length > 1) {
        throw new Apierror(400, "one question is required!");
    }

    parsedQuestions.forEach((question, index) => {
        const { questionText, questionType, ansType } = question;

        const isQuestionValid = [questionText, questionType, ansType].every(
            (item) => item !== null && item !== undefined && item !== "" && (typeof item !== "string" || item.trim() !== "")
        );

        if (!isQuestionValid) {
            throw new Apierror(400, `Please fill out all the required fields for question #${index + 1}: "${questionText}".!!`);
        }
        if (questionType !== "image") throw new Apierror(400, "This API only handles image questions.!!");

        const images = req.files; // Uploaded files
        if (!images) throw new Apierror(400, `No images uploaded for question: ${questionText}.!!`);

        ["imageA", "imageB", "imageC", "imageD"].forEach((fieldNames) => {
            if (!images[fieldNames] || images[fieldNames].length === 0) {
                throw new Apierror(400, `No image uploaded for ${fieldNames}.!!`);
            }

            const { path, filename, fieldname } = images[fieldNames][0]; // Access file data
            if (!question.ansOptions.images) question.ansOptions.images = {};
            question.ansOptions.images[fieldname] = {
                path: path,
                filename: filename,
            };
        });
    });

    var dbSurvey = await Survey.findById(id);

    if (!dbSurvey) throw new Apierror(404, "Survey not found.");
    dbSurvey.questions.forEach((question) => {
        if (question.questionText === parsedQuestions[0].questionText) throw new Apierror(400, `Please fill only unique questions- ${parsedQuestions[0].questionText}.!!`)
    })


    dbSurvey.questions.push(parsedQuestions[0]);
    dbSurvey = await dbSurvey.save({ validateBeforeSave: true })


    // const survey = await Survey.findByIdAndUpdate(id, { $push: { questions: parsedQuestions } }, { new: true, runValidators: true });

    res.status(201).json(new ApiResponse(201, dbSurvey, "Image question added successfully!"));
});



export const getSurveyByCategory = asyncHandler(async (req, res) => {
    const { category } = req.query;

    console.log(category)

    if (!category) throw new Apierror(400, "please enter a query.!!");

    const survey = await Survey.aggregate([
        {
            $match: {
                category: category?.toLowerCase(),
            }
        }
    ])

    res.status(200).json(new ApiResponse(200, survey, "category wise Surveys fetched successfully.!!"));
});


export const searchSurveys = asyncHandler(async (req, res) => {
    const { filter = {}, projection = {}, sort = {}, page = 1, limit = 10 } = req.query;

    console.log(typeof filter);

    const pipeline = [];


    // 1. Match stage (filters based on conditions like published status, category, etc.)
    if (filter && typeof filter === 'object' && Object.keys(filter).length > 0) {
        pipeline.push({
            $match: filter,
        });
    }

    // 2. Unwind stage (if you need to flatten the array of questions for detailed projection)
    pipeline.push({
        $unwind: {
            path: "$questions", // Flatten the questions array
            preserveNullAndEmptyArrays: true, // Keep documents without questions
        },
    });

    // 3. Projection stage (select fields you want to include or exclude)
    if (Object.keys(projection).length > 0) {
        pipeline.push({
            $project: projection
        })
    } else {
        pipeline.push({
            $project: {
                _id: 1,
                title: 1,
                category: 1,
                "questions.questionText": 1,
                "questions.questionType": 1,
                "questions.ansType": 1,
                "questions.ansOptions": 1,
                created_by: 1,
                createdAt: 1,
                updatedAt: 1,
                publishedAt: 1,
                scheduledPublishDate: 1,
                isPublished: { $eq: ["$publishStatus", "published"] },
                isScheduled: { $eq: ["$publishStatus", "scheduled"] },
                isExpired: {
                    $cond: [
                        { $eq: ["$publishStatus", "scheduled"] },
                        { $lt: ["$scheduledPublishDate", new Date()] },
                        false
                    ]
                },
            },
        })
    };


    // 4. Sorting stage (sort the documents based on specified criteria like title or created date)
    if (Object.keys(sort).length > 0) {
        pipeline.push({
            $sort: sort
        })
    }

    // 5. Pagination stage (skip and limit for paginated results)
    pipeline.push({
        $skip: (page - 1) * limit,
    })

    pipeline.push({
        $limit: limit,
    });

    const surveys = await Survey.aggregate(pipeline);

    res.status(200).json(new ApiResponse(200, surveys, "Surveys fetched successfully.!!"));
})
// { $dateToString: { format: "%Y-%m-%d-%H:%M", date: "$scheduledPublishDate" } },
// { $dateToString: { format: "%Y-%m-%d-%H:%M", date: new Date() } }

export const getAllSurveys = asyncHandler(async (req, res) => {
    // const { filter = {
    //     // // category: "technology",
    //     // scheduledPublishDate: { $gte: new Date("2024-12-13") }
    // }, projection = {}, sort = { "createdAt": -1 }, page = 1, limit = 10 } = req.query;

    const pipeline = [
        {
            $set: {
                publishStatus: {
                    $cond: {
                        if: {
                            $and: [
                                { $eq: ["$publishStatus", "scheduled"] },
                                {
                                    $lte: ["$scheduledPublishDate", new Date]
                                }
                            ]
                        },
                        then: "published",
                        else: "$publishStatus" //Keep the original publishStatus if condition is not met
                    }
                }
            }
        }
    ];

    if (req.user?.preferredSurveyCategory) {
        pipeline.push({
            $match: {
                publishStatus: "published",
                $or: {
                    category: `${req.user.preferredSurveyCategory}`
                }
            }
        })
    } else {
        pipeline.push({
            $match: {
                publishStatus: "published"
            }
        })
    };

    pipeline.push(
        {
            $addFields: {
                questionsCount: { $size: "$questions" }
            }
        },
        {
            $project: {
                title: 1,
                category: 1,
                "questions.questionText": 1,
                "questions.questionType": 1,
                "questions.ansType": 1,
                "questions.ansOptions": 1,
                publishStatus: 1,
                scheduledPublishDate: 1,
                questionsCount: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        },
        { $limit: 10 },
        { $sort: { "createdAt": -1 } }
    );


    const surveys = await Survey.aggregate(pipeline)

    res.status(200).json(new ApiResponse(200, surveys, "Surveys fetched successfully.!!"));
})

