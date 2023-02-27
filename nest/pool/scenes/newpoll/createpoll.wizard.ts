import {Action, Ctx, Message, On, Wizard, WizardStep} from "nestjs-telegraf";
import {WizardContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../../services/keyboard.service";
import {CallbackWithData, PollEntity, SceneContextUpdate} from "../../../../types/common";
import {Update as TUpdate, Update} from "telegraf/typings/core/types/typegram";
import {PollService} from "../../services/poll.service";
import {Context} from "telegraf";
import {PollOptions} from "../../../../models/types/pool";

@Wizard('createpoll')
export class CreatePollWizard {

    private poll: Partial<PollEntity> & { options: PollOptions} = {
        options: this.setDefaultOptions(),
    };

    constructor(@Inject(PollService) private readonly pollService: PollService,
                @Inject(KeyboardService) private readonly keyboardService: KeyboardService) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext & { wizard: { state: { chatId: number }}}) {
        this.poll = {
            options: this.setDefaultOptions(),
        };
        this.poll.chatId = ctx.wizard.state.chatId;
        await ctx.reply("Пришлите название опроса. Оно должно быть уникальным, чтобы вам было легче ориентироваться");
        await ctx.wizard.next();
    }


    @On('text')
    @WizardStep(2)
    async onPollCommand(@Ctx() ctx: WizardContext,
                        @Message() msg: { text: string}) {
        this.poll.command = msg.text;
        await ctx.wizard.next();
        return "Создайте новый опрос";
    }

    @On('poll')
    @WizardStep(3)
    async onPoll(@Ctx() ctx: WizardContext & Context<TUpdate.MessageUpdate & { message: TUpdate.PollUpdate}>) {
        const { poll } = ctx.update.message;

        this.poll.question = poll.question;
        this.poll.answers = poll.options.map((el) => el.text);
        this.poll.options.isAnonymous = poll.is_anonymous;
        this.poll.options.allowsMultipleAnswers = poll.allows_multiple_answers;

        await ctx.wizard.next();
        return this.keyboardService.showPollSettingsKeyboard(ctx);
    }


    @WizardStep(4)
    @Action(/polloption/)
    async onPollSetting(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>> & WizardContext) {
        const { data } = context.update.callback_query;
        const setting = data.split(':')[1];

        switch (setting) {
            case 'pinPool':
                this.poll.options.pinPool = true;
                return 'Закрепить ✅.'
            // TODO Переименовать extraText
            case 'addTimeToTitle':
                this.poll.options.addTimeToTitle = true;
                return 'Доп. текст опроса ✅.'
            case 'save':
            case 'cancel':
                return this.onSaving(context, setting);
        }
    }

    private async onSaving(context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>,
                   option: string) {
        await this.keyboardService.hideKeyboard(context);

        switch (option) {
            case 'save':
                this.assertPoll(this.poll);
                await this.pollService.createPoll(this.poll);
                return "Опрос сохранен."
            case 'cancel':
                return "Изменения отменены."
        }

        await context.scene.leave();
    }

    private assertPoll(pool: Partial<PollEntity>): asserts pool is PollEntity {
        if(!this.poll.command || !this.poll.question || !this.poll.answers || !this.poll.chatId || !this.poll.options) {
            throw -1;
        }
    }

    private setDefaultOptions(): PollOptions {
        return {
            isAnonymous: false,
            allowsMultipleAnswers: false,
            pinPool: false,
            addTimeToTitle: false,
        }
    }

}

