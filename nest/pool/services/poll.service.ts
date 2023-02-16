import {Injectable} from "@nestjs/common";
import {PollDocument} from "../../../models/types/pool";
import Chat from "../../../models/Chat";
import Pool from "../../../models/Pool";
import {PollEntity} from "../../../types/common";

@Injectable()
export class PollService {

    public async createPool(poll: PollEntity) {
        const chat = await Chat.findOne({ chatId: poll.chatId }).lean();

        if(!chat)
            return;

        const pool = new Pool({
            _chat: chat._id,
            command: poll.command,
            question: poll.question,
            answers: poll.answers,
            options: poll.options,
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
