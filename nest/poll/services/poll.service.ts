import {Injectable} from "@nestjs/common";
import {PollDocument} from "../../../models/types/poll";
import Chat from "../../../models/Chat";
import Poll from "../../../models/Poll";
import {PollEntity} from "../../../types/common";

@Injectable()
export class PollService {

    public async createPoll(poll: PollEntity) {
        const chat = await Chat.findOne({ chatId: poll.chatId }).lean();

        if(!chat)
            return;

        const doc = new Poll({
            _chat: chat._id,
            command: poll.command,
            question: poll.question,
            answers: poll.answers,
            options: poll.options,
        });

        await doc.save();
    }

    public async deletePoll(pollId: string): Promise<void> {
        await Poll.deleteOne({_id: pollId});
    }

    public async getPollList(chatId: number): Promise<PollDocument[]>{
        const chat = await Chat.findOne({ chatId }).lean();

        if(!chat)
            return [];

        return Poll.find({ _chat: chat._id}).lean();
    }

    public async countPoll(chatId: number): Promise<number> {
        const chat = await Chat.findOne({ chatId }).lean();

        if(!chat)
            return 0;

        return Poll.countDocuments({ _chat: chat._id});
    }

    public async getPoll(pollId: string): Promise<PollDocument | null> {
        return Poll.findOne({_id: pollId}).lean();
    }
}
