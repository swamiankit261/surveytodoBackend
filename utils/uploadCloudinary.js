import cloudinary from "cloudinary";
import asyncHandler from "./asyncHandler.js";
import { Apierror } from "./apiError.js";

export const UploadCloudinary = async (path, folderName) => {
    try {
        if (!(path && folderName)) throw new Apierror(400, "image path and folder name is required!!");

        const cloud = await cloudinary.v2.uploader.upload(path, {
            folder: `${folderName}`,
            resource_type: "image",
            width: 250,
            crop: "scale",
        }).catch(err => { throw new Apierror(409, `Cloudinary upload error: ${err.message}!!`) });

        if (!cloud.secure_url) throw new Apierror(409, "Cloudinary upload failed !!");

        return cloud;
    } catch (error) {
        console.error(error);
        throw new Apierror(409, `Cloudinary upload error: ${error.message}`);
    }
};


const updateCloudinary = async (public_id, path, folderName) => {
    
}