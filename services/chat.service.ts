import {Injectable} from "@nestjs/common";
import {InjectBot} from "nestjs-telegraf";
import {Context, Telegraf} from "telegraf";
import IChatService from "../types/services/IChatService";
import {ChatDocument} from "../models/types/chat";
import Chat from "../models/Chat";
import Poll from "../models/Poll";


@Injectable()
export class ChatService implements IChatService<ChatDocument> {

    constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

    async getChatList(userId: number): Promise<ChatDocument[]> {
        return Chat.find({ admins: userId }).lean();
    }

    public async getChat(id: number): Promise<ChatDocument | null> {
        return Chat.findOne({ chatId: id }).lean()
    }

    async createChat(id: number, title: string, userId: number): Promise<ChatDocument> {
        let chat = await Chat.findOne({ chatId: id }).lean();

        if(chat)
            throw new Error("Internal error");

        return Chat.create({
            title,
            chatId: id,
            admins: [userId],
        })
    }

    async removeChat(id: number): Promise<void> {
        const chat = await Chat.findOneAndDelete({chatId: id});

        if(chat) {
            await Poll.deleteMany({_chat: chat._id })
        }
    }

    public async updateChatUsers(userId: number): Promise<void> {
        const chats = await Chat.find({});
        for(let chat of chats) {
            let member = await this.checkAdminRestriction(chat.chatId, userId);
            if(!member)
                continue;

            const isAlreadyAdmin = chat.admins.some(admin => admin === userId);
            if (!isAlreadyAdmin) {
                chat.admins.push(userId);
                await chat.save();
            }
        }
    }

    private async checkAdminRestriction(chatId: number, userId: number): Promise<boolean> {
        let info = await this.bot.telegram.getChatAdministrators(chatId).catch(() => {});
        if(!info)
            return false;

        return info.some((el) => el.user.id === userId)
    }
}
