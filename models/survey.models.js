import mongoose from "mongoose";

const schema = mongoose.Schema;

const questionsSchema = new schema({
    questionText: {
        type: String,
        minLength: [20, "Question must have at least 20 characters."],
        maxLength: [200, "Question must not exceed 200 characters.!!"],
        unique: true,
        validate: {
            validator: function (value) {
                const regex = /^[a-zA-Z0-9\s.,!?'"-]*$/;
                return regex.test(value);
            },
            message: props => `Question contains invalid characters. Allowed: letters, numbers, and spaces. Found: "${props.value}".!!`,
        },
        required: [true, "Question text is required.!!"],
    },
    questionType: {
        type: String,
        enum: ["radio", "checkbox", "select", "image", "textEditor"],
        required: [true, "Question questionType is required.!!"],
    },
    ansType: {
        type: String,
        enum: {
            values: ["Single Choice", "Multiple Choice", "Textual Response"],
            message: `{VALUE}- is not a valid answer type. Choose from 'Single Choice', 'Multiple Choice', or 'Textual Response'.!!`,
        },
        validate: {
            validator: function (value) {
                const questionType = this.questionType;
                if (questionType === 'textEditor') {
                    // For text editor questions, ansType should be 'Textual Response'
                    return value === 'Textual Response';
                }
                return true;
            },
            message: props => `Text editor questions must have 'Textual Response' as answer type. Found: "${props.value}".!!`,
        },
        required: [true, "Answer type is required.!!"],
    },
    ansOptions: {
        optionA: {
            type: String,
            maxLength: [200, "Option must not exceed 200 characters."],
        },
        optionB: {
            type: String,
            maxLength: [200, "Option must not exceed 200 characters."],
        },
        optionC: {
            type: String,
            maxLength: [200, "Option must not exceed 200 characters."],
        },
        optionD: {
            type: String,
            maxLength: [200, "Option must not exceed 200 characters."],
        },
        images: {
            type: Map,
            of: Object,
            required: false
        }
    }

});


const surveySchema = new schema(
    {
        title: {
            type: String,
            required: [true, "survey title must be required.!!"],
        },
        category: {
            type: String,
            enum: ["technology", "health", "education", "human-resources", "finance", "entertainment", "travel", "food", "sports", "ecommerce", "fashion", "government", "real-estate"],
            lowercase: true,
            required: [true, "survey category must be required.!!"],
        },
        questions: [
            {
                type: questionsSchema,
                required: [true, "questions must be required.!!"],
            },
        ],
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "created_by must be an ObjectId reference to a User.!!"],
        },
        publishStatus: {
            type: String,
            enum: ["draft", "published", "scheduled"],
            required: [true, "publishesStatus is required.!!"],
        },
        scheduledPublishDate: {
            type: Date,
            // default: new Date
        },

    },
    { timestamps: true }
);

surveySchema.virtual("isPublished").get(function () {
    return this.publishStatus === "published";
});

surveySchema.index({ title: 1, createdBy: 1 });

export default mongoose.model("Survey", surveySchema);
