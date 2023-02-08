import {Inject, Injectable} from "@nestjs/common";
import {Markup} from "telegraf";
import {QueryTypeEnum} from "../../../app/queries/QueryTypeEnum";
import {ChatService} from "./chat.service";
import {PollService} from "./poll.service";
import {Ctx} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";

@Injectable()
export class KeyboardService {

    constructor(@Inject(ChatService) private readonly chatService: ChatService,
                @Inject(PollService) private readonly pollService: PollService) {}

    async showChatKeyboard(@Ctx() context: SceneContext, id: number){
        const chatList = await this.chatService.getChatList(id);
        let buttons = chatList.map(el =>
            Markup.button.callback(el.title, JSON.stringify({type: QueryTypeEnum.CHOOSE_CHAT})));

        if(buttons.length === 0)
            return "Нет доступных чатов. Сначала добавьте бота в чат, в который вы хотите публиковать опросы. " +
                "Вы также должны обладать правами администратора."

        await context.reply(
            'Выберите чат',
            Markup.inlineKeyboard(buttons, {
                columns: 4
            })
        );
    }

    async showPollKeyboard(@Ctx() context: SceneContext, chatId: number){
        const polls = await this.pollService.getPoolList(chatId);
        let buttons = polls.map(el =>
            Markup.button.callback(el.command, JSON.stringify({poolId: el._id, type: QueryTypeEnum.CHOOSE_POOL})));

        if(buttons.length === 0)
            return "Для этого чата нет созданных опросов. Отправьте /newpool, чтобы создать новый опрос.";


        await context.reply(
            'Выберите чат',
            Markup.inlineKeyboard(buttons, {
                columns: 4
            })
        );
    }
}
