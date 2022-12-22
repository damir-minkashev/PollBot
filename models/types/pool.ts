import {Types, Document} from "mongoose";
import {ChatDocument} from "./chat";

export interface PoolDocument extends Document {
    _chat: ChatDocument | Types.ObjectId;
    command: string;
    question: string;
    answers: string[];
    options: PoolOptions,
}

export interface PoolOptions {
    isAnonymous: boolean,
    allowsMultipleAnswers: boolean,
    pinPool: boolean,
    addTimeToTitle: boolean,
}
