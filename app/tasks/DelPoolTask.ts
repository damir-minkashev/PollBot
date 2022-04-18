import PoolController from "../../controllers/PoolController";

export default class DelPoolTask {

    private chatId: number | undefined;

    private state: State;

    constructor(private poolController: PoolController) {
        this.state = State.SET_CHAT_ID;
    }

    public setChatId(chatId: number) {
        this.chatId = chatId;
    }

    public deletePool(poolId: string) {
        //todo add assertation
        this.poolController.deletePool(poolId, this.chatId as number);
    }
}

enum State {
    SET_CHAT_ID,
    SET_POOL,
    DONE
}
