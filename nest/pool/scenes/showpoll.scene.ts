import {Ctx, On, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {QueryTypeEnum} from "../../../app/queries/QueryTypeEnum";
import {Inject} from "@nestjs/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {CallbackWithData, SceneContextUpdate} from "../../../types/common";
import {KeyboardService} from "../services/keyboard.service";

@Scene('showpolls')
export class ShowPollScene {
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
            return this.keyboardService.showPollKeyboard(context, data.chatId);
        }
    }
}
