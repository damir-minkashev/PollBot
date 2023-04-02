import {Action, Ctx, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../../services/keyboard.service";
import {CallbackWithData, SceneContextUpdate} from "../../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {IPollService} from "../../../../types/services/IPollService";
import {PollDocument} from "../../../../models/types/poll";
import {PollService} from "../../../../services/poll.service";

const MAX_COUNT_POLLS: number = 25;

@Scene('newpoll')
export class NewPollScene {

    constructor(@Inject(KeyboardService) private readonly keyboardService: KeyboardService,
                @Inject(PollService) private readonly pollService: IPollService<PollDocument>) {}

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

        try {
            await this.assertIsMaxCountPolls(chatId);
        } catch {
            await context.reply('Достигнуто максимальное количество опросов.')
            return context.scene.leave();
        }

        await context.scene.leave();
        return context.scene.enter('createpoll', { chatId });
    }

    private async assertIsMaxCountPolls(chatId: number) {
        const countPolls = await this.pollService.countPoll(chatId);

        if(countPolls >= MAX_COUNT_POLLS) {
            throw new Error('Max poll reached');
        }
    }
}
