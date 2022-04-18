import PoolController from "../../controllers/PoolController";
import {PoolSchema} from "../../schema/PoolSchema";

export default class SendPoolTask {

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