import {Action, Ctx, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../../services/keyboard.service";
import {CallbackWithData, SceneContextUpdate} from "../../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";

@Scene('newpoll')
export class NewPollScene {

    constructor(@Inject(KeyboardService) private readonly keyboardService: KeyboardService) {}

    @SceneEnter()
    async onSceneEnter(@Ctx() context: SceneContext,
                       @Sender('id') id: number) {
        return this.keyboardService.showChatKeyboard(context, id);
    }

    @Action(/showchats/)
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        // TODO вынести преобразование
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { chatId } = JSON.parse(json);
        await this.keyboardService.hideKeyboard(context);

        await context.scene.leave();
        return context.scene.enter('createpoll', { chatId });
    }
}
