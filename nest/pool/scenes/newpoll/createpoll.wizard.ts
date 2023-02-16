import {Action, Ctx, InjectBot, Message, On, Wizard, WizardStep} from "nestjs-telegraf";
import {WizardContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../../services/keyboard.service";
import {CallbackWithData, PollEntity, SceneContextUpdate} from "../../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {PollService} from "../../services/poll.service";

@Wizard('createpoll')
export class CreatePollWizard {

    private poll: Partial<PollEntity> = {};

    constructor(@Inject(PollService) private readonly pollService: PollService,
                @Inject(KeyboardService) private readonly keyboardService: KeyboardService) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: any) {
        this.poll.chatId = ctx.wizard.state.chatId;
        ctx.reply("Пришлите название опроса. Оно должно быть уникальным, чтобы вам было легче ориентироваться");
        await ctx.wizard.next();
    }

    @On('text')
    @WizardStep(2)
    async onPollName(@Ctx() ctx: WizardContext,
                     @Message() msg: { text: string}){
        this.poll.command = msg.text;
        await ctx.wizard.next();
        return "Пришлите текст вопроса";
    }

    @On('text')
    @WizardStep(3)
    async onPollQuestion(@Ctx() ctx: WizardContext,
                         @Message() msg: { text: string}){
        this.poll.question = msg.text;
        await ctx.wizard.next();
        return "Пришлите как минимум два варианта ответа";
    }

    @On('text')
    @WizardStep(4)
    async onPollAnswer(@Ctx() ctx: WizardContext,
                       @Message() msg: { text: string}){
        if(msg.text === '/done') {
            if(this.poll.answers && this.poll.answers.length < 2) {
                return "Вариантов ответов должно быть минимум два. Пришлите варианты ответов."
            }

            await ctx.wizard.next();
            return this.keyboardService.showPollSettingsKeyboard(ctx);
        }

        this.poll.answers = this.poll.answers || [];
        this.poll.answers.push(msg.text);

        if(this.poll.answers.length >= 10) {
            await ctx.wizard.next();
            return "Достигнуто максимальное количество ответов."
        }

        return "Пришлите варианты ответов. Если вы хотите закончить, пришлите /done";
    }

    @WizardStep(5)
    @Action(/polloption/)
    async onPollSetting(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>> & WizardContext) {
        const { data } = context.update.callback_query;
        const setting = data.split(':')[1];
        this.poll.options = this.poll.options || {
            isAnonymous: false,
            allowsMultipleAnswers: false,
            pinPool: false,
            addTimeToTitle: false,
        };

        switch (setting) {
            case 'pinPool':
                this.poll.options.pinPool = true;
                return 'Закрепить ✅. Чтобы закончить, нажмите Показать.'
            case 'isAnonymous':
                this.poll.options.isAnonymous = true;
                return 'Анонимно ✅. Чтобы закончить, нажмите Показать.'
            // TODO Переименовать multipleAnswers
            case 'allowsMultipleAnswers':
                this.poll.options.allowsMultipleAnswers = true;
                return 'Несколько ответов ✅. Чтобы закончить, нажмите Показать.'
            // TODO Переименовать extraText
            case 'addTimeToTitle':
                this.poll.options.addTimeToTitle = true;
                return 'Доп. текст опроса ✅. Чтобы закончить, нажмите Показать.'
            case 'show':
                // TODO Добавить проверку поле this.pool
                await this.replyPoll(context);
                await context.wizard.next();
                return this.keyboardService.showSaveKeyboard(context);
        }
    }

    @WizardStep(6)
    @Action(/pollsave/)
    async onSaving(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>) {
        await this.keyboardService.hideKeyboard(context);
        const { data } = context.update.callback_query;
        const result = data.split(':')[1];

        switch (result) {
            case 'save':
                this.assertPoll(this.poll);
                await this.pollService.createPool(this.poll);
                return "Опрос сохранен."
            case 'cancel':
                return "Изменения отменены. Пришлите /newpoll"
        }

        await context.scene.leave();
    }

    private async replyPoll(context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>>){
        this.assertPoll(this.poll);

        await context.replyWithPoll(this.poll.question, this.poll.answers, {
            is_anonymous: this.poll.options.isAnonymous,
            allows_multiple_answers: this.poll.options.allowsMultipleAnswers,
        });
    }

    private assertPoll(pool: Partial<PollEntity>): asserts pool is PollEntity {
        if(!this.poll.command || !this.poll.question || !this.poll.answers || !this.poll.chatId || !this.poll.options) {
            throw -1;
        }
    }

}

