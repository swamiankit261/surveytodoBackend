import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const schema = mongoose.Schema;

const userSchema = new schema({
    userName: {
        type: String,
        required: [true, "please enter a userName !!"],
        trim: true,
        lowercase: true,
        minLength: [4, "userName should have more than 4 characters !!"],
        maxLength: [30, "name cannot exceed 30 characters"]
    },
    email: {
        type: String,
        required: [true, "Please enter a valid email !!"],
        lowercase: true,
        trim: true,
        unique: true,
        index: true,
        validate: [function (value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }, "Email address must begin with a letter or underscore character and contain only alphanumeric characters !!"]
    },
    role: { // User roles
        type: String,
        enum: ["user", "admin", "superAdmin"],
        default: "user"
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: { // cloudinary url
            type: String,
            required: true
        }
    },
    preferredSurveyCategory: { // Set on first login for users
        type: String,
        enum: ["Technology", "Health", "Education"], // Example categories
        default: null
    },
    password: {
        type: String,
        select: false,
        required: [true, "Please enter a password !!"],
        minLength: [8, "Password should have more than 8 characters !!"],
        match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character !!"]
    },
    refreshToken: {
        type: String,
        select: false
    }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
};

userSchema.methods.generateAccessToken = function () {
    try {
        return jwt.sign(
            { id: this._id, email: this.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );
    } catch (error) {
        console.error("Error generating access token:", error);
        throw new Error("Token generation failed");
    }
};


userSchema.methods.generateRefreshToken = function () {
    try {
        return jwt.sign(
            { id: this._id, email: this.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
        );
    } catch (error) {
        console.error("Error generating refresh token:", error);
        throw new Error("Token generation failed");
    }
};

const User = mongoose.model("User", userSchema);

export default User;