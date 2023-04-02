import {Document, Types} from "mongoose";
import {PollData} from "../../types/data/PollData";
import {ChatDocument} from "./chat";

export interface PollDocument extends PollData<TChatTypes>, Document {}

type TChatTypes = ChatDocument | Types.ObjectId
