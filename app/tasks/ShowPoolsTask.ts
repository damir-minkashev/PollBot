import {PoolSchema} from "../../schema/PoolSchema";
import PoolController from "../../controllers/PoolController";
import {PollDocument} from "../../models/types/pool";

export default class ShowPoolsTask {

    public chatId: number | undefined;

    constructor(private poolController: PoolController) {

    }

    public setChatId(chatId: number) {
        this.chatId = chatId;
    }

    public getPool(poolId: string): Promise<PollDocument | null> {
        return this.poolController.getPool(poolId);
    }
}
