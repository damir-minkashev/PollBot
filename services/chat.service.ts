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
        return Chat.find({ userId }).lean();
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
            userId
        })
    }

    async removeChat(id: number): Promise<void> {
        const chat = await Chat.findOneAndDelete({chatId: id});

        if(chat) {
            await Poll.deleteMany({_chat: chat._id })
        }
    }

    // Этот код пока оставим, пока не разберемся как сделать миграцию
    // private async getValidChatForUser(chatList: ChatDocument[], userId: number) {
    //     let result = [];
    //     for(let chat of chatList) {
    //         let member = await this.checkAccess(chat.chatId, userId);
    //         if(!member)
    //             continue;
    //
    //         result.push(chat);
    //     }
    //
    //     return result;
    // }

    // // TODO code repeats
    // private async checkAccess(chatId: number, userId: number) {
    //     let info = await this.bot.telegram.getChatAdministrators(chatId).catch(() =>{});
    //     if(!info)
    //         return ;
    //
    //     return info.find((el) => el.user.id === userId;)
    // }
}
