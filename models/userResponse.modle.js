import mongoose from "mongoose";

const { Schema } = mongoose;

const answersSchema = new Schema({
    question_id: {
        type: mongoose.Types.ObjectId,
        ref: "Survey",
        required: true
    },
    selectedOption: {
        type: String,
        enum: {
            values: ["Single Choice", "Multiple Choice", "Textual Response"],
            message: `{VALUE}- is not a valid selectedOption type. Choose from 'Single Choice', 'Multiple Choice', or 'Textual Response'.!!`,
        },
        required: true
    },
    answers: [
        {
            type: String,
            required: true
        }
    ]
})

const userAnswers = new Schema(
    {
        survey_id: {
            type: mongoose.Types.ObjectId,
            ref: "Survey",
            required: true
        },
        user_id: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true
        },
        answers: {
            type: [answersSchema]
        }
    }, { timestamps: true });


export default mongoose.model("Answers", userAnswers);