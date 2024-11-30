import cloudinary from "cloudinary";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const registerUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password, avatar } = req.body;

    if (!(userName && email && password && password && avatar)) throw new Apierror(400, "All fields are required!!");


    const userExists = await User.findOne({ email });
    if (userExists) { throw new Apierror(404, "User already exists!!") };

    // Upload image to Cloudinary
    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "SurveyAvatar",
        resource_type: "image",
        width: 250,
        crop: "scale",
    }).catch((error) => {
        throw new Apierror(409, `Cloudinary upload error: ${error.message}!!`);
    });

    if (!myCloud.secure_url) throw new Apierror(409, "Failed to upload image!!");

    const fields = {
        userName,
        email,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        },
        password
    };

    const user = (await User.create(fields));

    if (!user) throw new Apierror(409, "Failed to create user !!");

    res.status(201).json(new ApiResponse(201, { user }, "User created successfully!"));
});

export const surveyCategory = asyncHandler(async (req, res) => {
    const { preferredSurveyCategory, id } = req.body;

    if (!preferredSurveyCategory) throw new Apierror(400, "Preferred survey category is required!!");
    if (!id) throw new Apierror(400, "User id is required!!");
});