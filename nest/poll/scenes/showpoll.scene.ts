import {Action, Ctx, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {CallbackWithData, SceneContextUpdate} from "../../../types/common";
import {KeyboardService} from "../services/keyboard.service";
import {PollService} from "../../../services/poll.service";
import {IPollService} from "../../../types/services/IPollService";
import {PollDocument} from "../../../models/types/poll";

@Scene('showpolls')
export class ShowPollScene {
    constructor(@Inject(KeyboardService) private readonly keyboardService: KeyboardService,
                @Inject(PollService) private readonly pollService: IPollService<PollDocument>) {}


    @SceneEnter()
    async onSceneEnter(@Ctx() context: SceneContext,
                       @Sender('id') id: number) {
        return this.keyboardService.showChatKeyboard(context, id);
    }

    @Action(/showchats/)
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        // TODO скрыть это в интерсепторах или сделать собственный декоратор, например @ChatId
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { chatId } = JSON.parse(json);

        await this.keyboardService.hideKeyboard(context);
        return this.keyboardService.showPollKeyboard(context, chatId);
    }

    @Action(/showpoll/)
    async onChoosePoll(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>) {
        await this.keyboardService.hideKeyboard(context);

        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { id } = JSON.parse(json);

        const poll = await this.pollService.getPoll(id);

        if(!poll){
            return "Опрос не найден."
        }

        await context.replyWithPoll(poll.question, poll.answers, {
            is_anonymous: poll.options.isAnonymous,
            allows_multiple_answers: poll.options.allowsMultipleAnswers,
        });

        await context.scene.leave();
    }


}
