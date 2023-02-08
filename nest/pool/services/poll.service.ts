import {Injectable} from "@nestjs/common";
import {PoolDocument, PoolOptions} from "../../../models/types/pool";
import Chat from "../../../models/Chat";
import Pool from "../../../models/Pool";

@Injectable()
export class PollService {

    /**
     *
     * @param chatId
     * @param command
     * @param question
     * @param answers
     * @param options
     */
    public async createPool(chatId: number, command: string, question: string, answers: string[], options: PoolOptions) {
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

    public async getPoolList(chatId: number): Promise<PoolDocument[]>{
        // todo aggregation
        const chat = await Chat.findOne({ chatId });

        if(!chat)
            return [];

        return Pool.find({ _chat: chat._id}).lean();
    }

    public async getPool(poolId: string): Promise<PoolDocument | null> {
        return Pool.findOne({_id: poolId}).lean();
    }
}
