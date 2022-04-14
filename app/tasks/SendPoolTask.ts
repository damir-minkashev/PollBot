import PoolController from "../../controllers/PoolController";
import {PoolSchema} from "../../schema/PoolSchema";

export default class SendPoolTask {

    private chatId: number | undefined;

    private poolList: PoolSchema[] | undefined;

    constructor(private poolController: PoolController) {

    }

    public setChatId(chatId: number) {
        this.chatId = chatId;
    }

    public getPools(chatId: number) {
        return this.poolController.getPoolList(chatId).then(result => {
            this.poolList = result;
            return result;
        })
    }

    public getPool(poolId: string): PoolSchema | undefined {
        return this.poolList?.find((el) => {
            return el.id === poolId
        })
    }

}
