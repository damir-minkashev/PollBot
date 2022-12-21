import mongoose, { Schema} from "mongoose";

const ChatSchema = new Schema({
    title: {
        type: String,
        required: true
    },
})

export default mongoose.model("Chat", ChatSchema);
