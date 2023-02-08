import {Ctx, On, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../services/keyboard.service";
import {CallbackWithData, SceneContextUpdate} from "../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {QueryTypeEnum} from "../../../app/queries/QueryTypeEnum";

@Scene('newpoll')
export class NewPollScene {

    private chatId: number | null = null;

    constructor(@Inject(KeyboardService) private readonly keyboardService: KeyboardService) {}

    @SceneEnter()
    async onSceneEnter(@Ctx() context: SceneContext,
                       @Sender('id') id: number) {
        return this.keyboardService.showChatKeyboard(context, id);
    }

    @On('callback_query')
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        const data = JSON.parse(context.update.callback_query.data);

        if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
            await context.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as any)
            return "Пришлите название опроса";
        }
    }
}
