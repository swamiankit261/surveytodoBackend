import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { Apierror } from "../utils/apiError.js";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // try {
        const token = req.cookies?.accessToken ?? req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new Apierror(401, "No token provided!");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const id = decodedToken.id
        const user = await User.findById(id);

        if (!user) {
            throw new Apierror(401, "Invalid token!");
        }

        req.user = user;
        next();
    // } catch (error) {
    //     console.log(error.message)
    //     throw new Apierror(401, "Invalid access token!");
    // }
});
