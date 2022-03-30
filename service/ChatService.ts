import pool from "../db";
import ChatSchema from "../schema/ChatSchema";

export default class ChatService {

    public createChat(id: number, title: string) {
        return pool.query(`INSERT INTO chats (id, title) VALUES ($1, $2)`, [id, title])
    }

    public getChat(id: number): Promise<ChatSchema | undefined> {
        return pool.query<ChatSchema>(`SELECT * FROM chats WHERE id=${id}`)
            .then((result) => {
                return result.rows.shift();
            });
    }

    public updateChat() {

    }

    public deleteChat(id: number) {
        return pool.query<ChatSchema>(`DELETE FROM chats WHERE id=${id} RETURNING *`)
            .then((result) => {
                return result.rows.shift();
            });
    }

    public getChatList() {
        return pool.query<ChatSchema>(`SELECT * FROM chats`)
            .then((result) => {
                return result.rows;
            })
    }
}
