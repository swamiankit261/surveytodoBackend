import cloudinary from "cloudinary";
import jwt from "jsonwebtoken";
import { UploadCloudinary } from "../utils/uploadCloudinary.js";
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
    if (userExists) { throw new Apierror(400, "User already exists!!") };

    // Upload image to Cloudinary
    const myCloud = await UploadCloudinary(avatar, "SurveyAvatar")

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

    res.status(201).json(new ApiResponse(201, user, "User created successfully!"));
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

export const logoutUser = asyncHandler(async (req, res) => {
    const id = req.user._id;

    const user = await User.findById(id);

    if (!user) throw new Apierror(404, "User not found.!!");


    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    res.status(200).clearCookie("accessToken", options)
        .json(new ApiResponse(200, { message: "User logged out successfully!!" }));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
    const { userName, email, avatar } = req.body;

    if (!(userName || email || avatar)) throw new Apierror(400, "Provide at least one of your names,avatar or emails.!!");

    if (userName && req.user.userName === userName) throw new Apierror(400, "userName is already in use.!!");

    if (email && req.user.email === email) throw new Apierror(400, "email is already in use.!!");

    var user = await User.findOne({ email: email });

    if (user) throw new Apierror(400, "email is already in use.!!");

    const updateFields = {};
    if (userName) {
        updateFields.userName = userName;
    }
    if (email) {
        updateFields.email = email;
    }
    if (avatar) {
        cloudinary.v2.uploader.destroy(req.user.avatar.public_id);

        const myCloud = await UploadCloudinary(avatar, "SurveyAvatar");

        updateFields.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        };
    }

    user = await User.findByIdAndUpdate(req.user._id, { $set: updateFields }, { new: true, runValidators: true });

    if (!user) throw new Apierror(404, "User not found.!!");

    res.status(200).json(new ApiResponse(200, user, "User details updated successfully!!"));
});

export const updateAvatar = asyncHandler(async (req, res) => {
    const { avatar } = req.body;
    console.log(req.body);
    if (!avatar) throw new Apierror(400, "Avatar is required.!!");

    const myCloud = await UploadCloudinary(avatar, "SurveyAvatar");

    if (!myCloud?.public_id) throw new Apierror(400, "avatar not uploaded.!!")

    const user = await User.findByIdAndUpdate(req.user.id, { avatar: { public_id: myCloud.public_id, url: myCloud.url } }, { new: true, runValidators: true });

    if (!user) throw new Apierror(404, "User not found.!!");



    res.status(200).json(new ApiResponse(200, user, "Avatar updated successfully.!"));
})

export const refreshUserAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.header("refreshToken") || req.body.refreshToken || req.cookies.refreshToken;

    if (!incomingRefreshToken) throw new Apierror(401, "Refresh token is required");


    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken.id).select("refreshToken");

    if (!user) throw new Apierror(401, "Invalid refresh token.!!");

    if (user?.refreshToken !== incomingRefreshToken) throw new Apierror(401, "Invalid refresh token..!!");

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(decodedToken.id);

    res.cookie("accessToken", accessToken, options).status(200).json(new ApiResponse(200, { refreshToken, accessToken }, "access token recreated successfully.!"));
});