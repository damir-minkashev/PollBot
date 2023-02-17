import {Injectable} from "@nestjs/common";
import Chat from "../../../models/Chat";
import {InjectBot} from "nestjs-telegraf";
import {Context, Telegraf} from "telegraf";
import Poll from "../../../models/Poll";

@Injectable()
export class ChatService {
    constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

    async getChatList(userId: number) {
        return Chat.find({ userId }).lean();
    }

    async createChat(id: number, title: string, userId: number) {
        let chat = await Chat.findOne({ chatId: id }).lean();

        if(chat)
            return;

        await Chat.create({
            title,
            chatId: id,
            userId
        })
    }

    async removeChat(id: number) {
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
