import Chat from "../models/Chat";
import {ChatDocument} from "../models/types/chat";

export default class ChatService {

    public async createChat(id: number, title: string) {
        const chat = new Chat({
            title,
            chatId: id,
        });

       await chat.save();
    }

    public async getChat(id: number): Promise<ChatDocument | null> {
        return Chat.findOne({ chatId: id }).lean();
    }

    public updateChat() {

    }

    public async deleteChat(id: number): Promise<void> {
        await Chat.deleteOne({chatId: id});
    }

    public getChatList() {
        return Chat.find().lean();
    }
}
