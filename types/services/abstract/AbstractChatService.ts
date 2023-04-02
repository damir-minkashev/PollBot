export interface AbstractChatService<T> {
    getChatList(userId: number): Promise<T[]>;
    createChat(id: number, title: string, userId: number): Promise<T>;
    removeChat(id: number): Promise<void>;
    getChat(id: number): Promise<T | null>;
}
