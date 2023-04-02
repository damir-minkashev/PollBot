import {Inject, Injectable} from "@nestjs/common";
import IChatService from "../types/services/IChatService";
import {ChatDocument} from "../models/types/chat";
import {PollDocument} from "../models/types/poll";
import {IPollService} from "../types/services/IPollService";
import {PollEntity} from "../types/common";
import Poll from "../models/Poll";
import {ChatService} from "./chat.service";

@Injectable()
export class PollService implements IPollService<PollDocument> {

    constructor(@Inject(ChatService) private readonly chatService: IChatService<ChatDocument>) {}

    public async createPoll(poll: PollEntity): Promise<PollDocument> {
        const chat = await this.chatService.getChat(poll.chatId);

        if(!chat)
            throw new Error("Internal error");

        const doc = new Poll({
            _chat: chat._id,
            command: poll.command,
            question: poll.question,
            answers: poll.answers,
            options: poll.options,
        });

        await doc.save();
        return doc;
    }

    public async deletePoll(pollId: string): Promise<void> {
        await Poll.deleteOne({_id: pollId});
    }

    public async getPollList(chatId: number): Promise<PollDocument[]>{
        const chat = await this.chatService.getChat(chatId);

        if(!chat)
            return [];

        return Poll.find({ _chat: chat._id}).lean();
    }

    public async countPoll(chatId: number): Promise<number> {
        const chat = await this.chatService.getChat(chatId);

        if(!chat)
            return 0;

        return Poll.countDocuments({ _chat: chat._id});
    }

    public async getPoll(pollId: string): Promise<PollDocument | null> {
        return Poll.findOne({_id: pollId}).lean();
    }
}
