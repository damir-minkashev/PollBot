import {Injectable} from "@nestjs/common";
import Chat from "../../../models/Chat";
import {ChatDocument} from "../../../models/types/chat";
import {InjectBot} from "nestjs-telegraf";
import {Context, Telegraf} from "telegraf";

@Injectable()
export class ChatService {
    constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

    async getChatList(userId: number) {
        return this.getValidChatForUser((await Chat.find().lean()), userId);
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
        // TODO удалять опросы
        await Chat.deleteOne({chatId: id});
    }

    // TODO сделать через Interceptor
    private async getValidChatForUser(chatList: ChatDocument[], userId: number) {
        let result = [];
        for(let chat of chatList) {
            let member = await this.checkAccess(chat.chatId, userId);
            if(!member)
                continue;

            result.push(chat);
        }

        return result;
    }

    private async checkAccess(chatId: number, userId: number) {
        let info = await this.bot.telegram.getChatAdministrators(chatId).catch(() =>{});
        if(!info)
            return ;

        return info.find((el) => {
            return el.user.id === userId;
        })
    }
}
