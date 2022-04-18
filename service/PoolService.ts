import pool from "../db";
import {randomUUID} from "crypto";
import {PoolSchema} from "../schema/PoolSchema";
import {PoolOptionsSchema} from "../schema/PoolOptionsSchema";
import PoolListEntitySchema from "../schema/PoolListEntitySchema";

export default class PoolService {

    /**
     *
     * @param chatId
     * @param name
     * @param question
     * @param answers
     * @param options
     */
    public async createPool(chatId: number, name: string, question: string, answers: string[], options: PoolOptionsSchema) {
        let poolId = randomUUID();
        await pool.query(`INSERT INTO pools (id, command, chat_id) VALUES ($1, $2, $3)`,
            [poolId, name, chatId]);
        await pool.query(`INSERT INTO pool_data (id, question, answers, options) VALUES ($1, $2, $3, $4)`,
            [poolId, question, answers, JSON.stringify(options)]);
    }

    public async deletePool(poolId: string): Promise<void> {
        // await pool.query(`DELETE FROM pool_content WHERE id IN (SELECT id FROM pools WHERE id=$1)`, [poolId]);
        // await pool.query(`DELETE FROM pool_data WHERE id=$1`, [poolId]);
        await pool.query(`DELETE FROM pools WHERE id=$1`, [poolId]);

    }

    public async getPoolList(chatId: number): Promise<PoolListEntitySchema[]>{
        return pool.query<PoolListEntitySchema>('SELECT * FROM pools WHERE chat_id=$1', [chatId])
            .then((res) => {
                return res.rows;
            });
    }

    public getPool(poolId: string): Promise<PoolSchema | undefined> {
        return pool.query('SELECT pool_data.id, pool_data.question, pool_data.answers, pool_data.options, pools.chat_id ' +
            'FROM pool_data ' +
            'INNER JOIN pools ' +
            'ON pools.id=pool_data.id ' +
            'WHERE pool_data.id=$1', [poolId])
            .then((result) => {
            return result.rows.shift();
        });
    }
}
