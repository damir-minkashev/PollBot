import mongoose, { Schema } from "mongoose";
import { ChatDocument } from "./types/chat";

const ChatSchema = new Schema<ChatDocument>({
    chatId: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true
    },
    admins: {
        type: [Number],
        required: true,
    },
})

export default mongoose.model("Chat", ChatSchema);
