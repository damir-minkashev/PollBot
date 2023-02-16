import Pool from "../models/Pool";
import Chat from "../models/Chat";
import {PollDocument, PollOptions} from "../models/types/pool";

export default class PoolService {

    /**
     *
     * @param chatId
     * @param command
     * @param question
     * @param answers
     * @param options
     */
    public async createPool(chatId: number, command: string, question: string, answers: string[], options: PollOptions) {
        const chat = await Chat.findOne({ chatId }).lean();

        if(!chat)
            return;

        const pool = new Pool({
            _chat: chat._id,
            command,
            question,
            answers,
            options,
        });

        await pool.save();
    }

    public async deletePool(poolId: string): Promise<void> {
        // await pool.query(`DELETE FROM pool_content WHERE id IN (SELECT id FROM pools WHERE id=$1)`, [poolId]);
        // await pool.query(`DELETE FROM pool_data WHERE id=$1`, [poolId]);
        await Pool.deleteOne({_id: poolId});

    }

    public async getPoolList(chatId: number): Promise<PollDocument[]>{
        // todo aggregation
        const chat = await Chat.findOne({ chatId });

        if(!chat)
            return [];

        return Pool.find({ _chat: chat._id}).lean();
    }

    public async getPool(poolId: string): Promise<PollDocument | null> {
        return Pool.findOne({_id: poolId}).lean();
    }
}
