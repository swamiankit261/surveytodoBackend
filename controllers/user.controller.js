import cloudinary from "cloudinary";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshTokens = asyncHandler(async (id) => {

    const user = await User.findById(id).select("+refreshToken");

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
});

const options = {
    expire: process.env.ACCESS_TOKEN_EXPIRY
        ? process.env.ACCESS_TOKEN_EXPIRY * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000, // default to 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure flag true only in production
    sameSite: "strict",
};// global options

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
    const { preferredSurveyCategory } = req.body;

    if (!preferredSurveyCategory) throw new Apierror(400, "Preferred survey category is required!!");

    const user = await User.findByIdAndUpdate(req.user._id, { preferredSurveyCategory }, { new: true, runValidators: true });

    if (!user) throw new Apierror(404, "User not found!!");

    res.status(200).json(new ApiResponse(200, { user }, "thanks for survey category !!"));
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!(email && password)) throw new Apierror(400, "Email and password are required!!");

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) throw new Apierror(401, "Invalid email or password!!");

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);

    res.status(200).cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, { user, refreshToken, accessToken }, "User logged in successfully!!"));
});