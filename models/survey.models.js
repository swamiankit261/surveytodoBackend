import mongoose from "mongoose";

const schema = mongoose.Schema;

new questionsSchema = new schema({})

const surveySchema = new schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }]
})