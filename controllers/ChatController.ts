import pool from "../db";
import ChatSchema from "../schema/ChatSchema";
import ChatService from "../service/ChatService";

//todo implement Abstract interface for DI
export default class ChatController {

    private service: ChatService;

    constructor() {
        this.service = new ChatService();
    }

    public async createChat(id: number, title: string) {
        let chat = await this.service.getChat(id);

        if(chat)
            return;

        await this.service.createChat(id, title);
    }

    public getChat(id: number): Promise<ChatSchema | undefined> {
        return this.service.getChat(id);
    }

    public updateChat() {

    }

    public deleteChat(id: number): Promise<ChatSchema | undefined> {
        return this.service.deleteChat(id);
    }

    public getChatList() {
        return this.service.getChatList();
    }
}
