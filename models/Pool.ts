import mongoose, {Schema, Types} from "mongoose";

const PoolSchema = new Schema({
    _chat: {
        type: Types.ObjectId,
        ref: 'Chat',
        index: true,
        required: true,
    },
    command: {
        type: String,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    answers: {
        type: [String],
        default: [],
    },
    options: {
        addTimeToTitle: {
            type: Boolean,
        },
        isAnonymous: {
            type: Boolean,
        },
        allowsMultipleAnswers: {
            type: Boolean,
        },
        pinPool: {
            type: Boolean,
        }
    }
})

export default mongoose.model('Pool', PoolSchema);
