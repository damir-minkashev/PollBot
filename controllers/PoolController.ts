import PoolService from "../service/PoolService";

export default class PoolController {

    private service: PoolService;

    constructor() {
        this.service = new PoolService();
    }

    public createPool(chatId: number, name: string, question: string, answers: string[]){
        return this.service.createPool(chatId, name, question, answers);
    }

    public getPoolList(chatId: number) {

    }

}
