import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler";
import { Apierror } from "../utils/apiError";
import User from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookise?.accessToken ?? req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new Apierror(401, "No token provided!");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken.id);

        if (!user) {
            throw new Apierror(401, "Invalid token!");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new Apierror(401, "Invalid access token!");
    }
});
