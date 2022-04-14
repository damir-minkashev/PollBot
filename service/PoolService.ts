import pool from "../db";
import {randomUUID} from "crypto";
import {PoolSchema} from "../schema/PoolSchema";

export default class PoolService {


    public async createPool(chatId: number, name: string, question: string, answers: string[]) {
        let poolId = randomUUID();
        await pool.query(`INSERT INTO pools (id, command, chat_id) VALUES ($1, $2, $3)`, [poolId, name, chatId]);
        await pool.query(`INSERT INTO pool_content (id, question, answers) VALUES ($1, $2, $3)`, [poolId, question, answers])
    }

    public async getPoolList(chatId: number) {
        let query = await pool.query('SELECT * FROM pools WHERE chat_id=$1', [chatId]);

        let pools = [];
        for(let item of query.rows) {
            let entity = await this.getPool(item.id);
            if(entity) {
                pools.push({
                    ...entity,
                    name: item.command,
                });
            }
        }

        return pools;
    }

    public getPool(poolId: string): Promise<PoolSchema | undefined> {
        return pool.query('SELECT * FROM pool_content WHERE id=$1', [poolId])
            .then((result) => {
            return result.rows.shift();
        });
    }
}
