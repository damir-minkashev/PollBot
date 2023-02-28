import {Types, Document} from "mongoose";
import {ChatDocument} from "./chat";

export interface PollDocument extends Poll, Document {}

export interface Poll {
    _chat: ChatDocument | Types.ObjectId;
    command: string;
    question: string;
    answers: string[];
    options: PollOptions,
}

export interface PollOptions {
    isAnonymous: boolean,
    allowsMultipleAnswers: boolean,
    pinPool: boolean,
    addTimeToTitle: boolean,
}
