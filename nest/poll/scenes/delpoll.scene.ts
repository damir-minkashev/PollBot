import {Action, Ctx, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {CallbackWithData, SceneContextUpdate} from "../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../services/keyboard.service";
import {IPollService} from "../../../types/services/IPollService";
import {PollDocument} from "../../../models/types/poll";
import {PollService} from "../../../services/poll.service";

@Scene('delpoll')
export class DelPollScene {

    private chatId: number | undefined;

    constructor(@Inject(KeyboardService) private readonly keyboardService: KeyboardService,
                @Inject(PollService) private readonly pollService: IPollService<PollDocument>) {}

    @SceneEnter()
    onEnter(@Ctx() context: SceneContext,
            @Sender('id') id: number) {
        return this.keyboardService.showChatKeyboard(context, id);
    }

    @Action(/showchats/)
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        // TODO скрыть это в интерсепторах или сделать собственный декоратор, например @ChatId
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { chatId } = JSON.parse(json);
        this.chatId = chatId;

        await this.keyboardService.hideKeyboard(context);
        return this.keyboardService.showPollKeyboard(context, chatId);
    }

    @Action(/showpoll/)
    async onChoosePoll(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>) {
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { id } = JSON.parse(json);

        await this.pollService.deletePoll(id);
        await context.scene.leave();
        return 'Опрос удален'
    }

}
