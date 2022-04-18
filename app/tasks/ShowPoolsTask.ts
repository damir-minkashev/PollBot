import {PoolSchema} from "../../schema/PoolSchema";
import PoolController from "../../controllers/PoolController";

export default class ShowPoolsTask {

    public chatId: number | undefined;

    constructor(private poolController: PoolController) {

    }

    public setChatId(chatId: number) {
        this.chatId = chatId;
    }

    public getPool(poolId: string): Promise<PoolSchema | undefined> {
        return this.poolController.getPool(poolId);
    }
}
