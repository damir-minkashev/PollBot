import PoolService from "../service/PoolService";
import {PoolOptionsSchema} from "../schema/PoolOptionsSchema";

export default class PoolController {

    private service: PoolService;

    constructor() {
        this.service = new PoolService();
    }

    public createPool(chatId: number, name: string, question: string, answers: string[], options: PoolOptionsSchema){
        return this.service.createPool(chatId, name, question, answers, options);
    }

    public deletePool(poolId: string,chatId: number) {
        return this.service.deletePool(poolId);
    }

    public getPoolList(chatId: number) {
        return this.service.getPoolList(chatId);
    }

    public getPool(poolId: string) {
        return this.service.getPool(poolId);
    }
}
