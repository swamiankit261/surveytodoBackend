import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ansImage", // Replace with your Cloudinary folder name
        quality: "auto:best",
        transformation: [{ width: 400, height: 500, crop: "fill" }],
        allowed_formats: ["jpg", "png", "jpeg", "pdf", "gif", "svg"],
    }
})


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "./public/temp"),
//     filename: (req, file, cb) => cb(null, file.originalname)
// });

// Configure Multer with Cloudinary Storage
export const upload = multer({ storage: storage });