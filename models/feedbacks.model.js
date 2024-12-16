import mongoose from "mongoose";

const feedbacks = new mongoose.Schema({
    whichSurvey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    },
    whichUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feddbackText: {
        type: String,
        // lowercase: true,
        minLength: [10, "feddback {VALUE} should have more than 10 characters.!!"],
        maxLength: [200, "feddback must not exceed 200 characters."]
    },
    rating: {
        type: Number,
        min: [1, "Rating should be between 1 and 5"],
        max: [5, "Rating should be between 1 and 5"],
        required: true,
    }
}, { timestamps: true });

export default mongoose.model("Rating", feedbacks);