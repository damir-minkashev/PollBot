import {Action, Ctx, Hears, On, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
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

    @Action(/showchats/)
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        console.log('showpoll scene', 'callback_query onChooseChat')
        // TODO скрыть это в интерсепторах или сделать собственный декоратор, например @ChatId
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { chatId } = JSON.parse(json);

        return this.keyboardService.showPollKeyboard(context, chatId);
    }
}
