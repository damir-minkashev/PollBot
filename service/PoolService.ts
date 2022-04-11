import pool from "../db";
import {randomUUID} from "crypto";

export default class PoolService {


    public async createPool(chatId: number, name: string, question: string, answers: string[]) {
        let poolId = randomUUID();
        await pool.query(`INSERT INTO pools (id, command, chat_id) VALUES ($1, $2, $3)`, [poolId, name, chatId]);
        await pool.query(`INSERT INTO pool_content (id, question, answers) VALUES ($1, $2, $3)`, [poolId, question, answers])
    }
}
