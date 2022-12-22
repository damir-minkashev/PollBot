import PoolController from "../../controllers/PoolController";
import {PoolSchema} from "../../schema/PoolSchema";
import {PoolDocument} from "../../models/types/pool";

export default class SendPoolTask {

    public chatId: number | undefined;

    public poolId: string = "";

    constructor(private poolController: PoolController) {

    }

    public setPoolId(poolId: string) {
        this.poolId = poolId;
    }

    public setChatId(chatId: number) {
        this.chatId = chatId;
    }

    public getPool(poolId: string): Promise<PoolDocument | null> {
        return this.poolController.getPool(poolId);
    }

}
