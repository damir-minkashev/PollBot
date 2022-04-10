import {Telegraf} from "telegraf";
import {NewPoolStateEnum} from "./NewPoolStateEnum";

export default class NewPoolTask {

    private poolState: NewPoolStateEnum

    private chatId: number | undefined;

    constructor(bot: Telegraf) {
        this.poolState = NewPoolStateEnum.CHOOSE_CHAT;
    }

    public isChooseChat() {
        return this.chatId !== undefined;
    }

    public setChatId(chatId: number) {
        this.chatId = chatId;
    }

}
