import {Injectable} from "@nestjs/common";
import {PollDocument} from "../../../models/types/pool";
import Chat from "../../../models/Chat";
import Poll from "../../../models/Poll";
import {PollEntity} from "../../../types/common";

@Injectable()
export class PollService {

    public async createPoll(poll: PollEntity) {
        const chat = await Chat.findOne({ chatId: poll.chatId }).lean();

        if(!chat)
            return;

        const pool = new Poll({
            _chat: chat._id,
            command: poll.command,
            question: poll.question,
            answers: poll.answers,
            options: poll.options,
        });

        await pool.save();
    }

    public async deletePoll(poolId: string): Promise<void> {
        await Poll.deleteOne({_id: poolId});
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

    public async getPoll(poolId: string): Promise<PollDocument | null> {
        return Poll.findOne({_id: poolId}).lean();
    }
}
