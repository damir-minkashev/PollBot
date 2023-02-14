import mongoose, {Schema, Types} from "mongoose";
import {PollDocument} from "./types/pool";

const PoolSchema = new Schema<PollDocument>({
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
