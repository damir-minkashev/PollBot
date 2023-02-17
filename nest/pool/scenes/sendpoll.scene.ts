import {Action, Ctx, InjectBot, Message, On, Sender, Wizard, WizardStep} from "nestjs-telegraf";
import {SceneContext, WizardContext} from "telegraf/typings/scenes";
import {Inject} from "@nestjs/common";
import {KeyboardService} from "../services/keyboard.service";
import {PollService} from "../services/poll.service";
import {CallbackWithData, SceneContextUpdate} from "../../../types/common";
import {Update} from "telegraf/typings/core/types/typegram";
import {Context, Telegraf} from "telegraf";
import {PollDocument} from "../../../models/types/pool";

@Wizard('sendpoll')
export class SendPollScene{

    private chatId: number | undefined;

    private poll: PollDocument | null = null;

    constructor(@InjectBot() private readonly bot: Telegraf<Context>,
                @Inject(KeyboardService) private readonly keyboardService: KeyboardService,
                @Inject(PollService) private readonly pollService: PollService) {}

    @WizardStep(1)
    async onEnter(@Ctx() context: WizardContext,
            @Sender('id') id: number) {
        await this.keyboardService.showChatKeyboard(context, id);
        await context.wizard.next();

    }

    @WizardStep(2)
    @Action(/showchats/)
    async onChooseChat(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>> & WizardContext){
        // TODO скрыть это в интерсепторах или сделать собственный декоратор, например @ChatId
        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { chatId } = JSON.parse(json);
        this.chatId = chatId;

        await this.keyboardService.hideKeyboard(context);
        await this.keyboardService.showPollKeyboard(context, chatId);

        await context.wizard.next();
    }

    @WizardStep(3)
    @Action(/showpoll/)
    async onChoosePoll(@Ctx() context: SceneContextUpdate<CallbackWithData<Update.CallbackQueryUpdate>> & WizardContext) {
        await this.keyboardService.hideKeyboard(context);

        const { data } = context.update.callback_query;
        const json = data.substring(data.indexOf(':') + 1);
        const { id } = JSON.parse(json);

        this.poll = await this.pollService.getPoll(id);

        if(!this.poll || !this.chatId){
            await context.scene.leave();
            return "Опрос не найден."
        }

        if(this.poll.options.addTimeToTitle) {
            await context.reply("Пришлите дату.");
            await context.wizard.next();
        } else {
            await this.sendPoll(context, this.chatId, this.poll);
        }
    }

    @WizardStep(4)
    @On('text')
    async onTimeToTitle(@Ctx() ctx: SceneContextUpdate<CallbackWithData<Update.MessageUpdate>>,
                        @Message() msg: { text: string}) {
        if(!this.poll || !this.chatId){
            await ctx.scene.leave();
            return "Опрос не найден."
        }

        this.poll.question = `${msg.text} ${this.poll.question}`;
        await this.sendPoll(ctx, this.chatId, this.poll);
    }

    private async sendPoll(ctx: SceneContext,
                           chatId: number,
                           poll: PollDocument) {
        const msg = await this.bot.telegram.sendPoll(chatId, poll.question, poll.answers, {
            is_anonymous: poll.options.isAnonymous,
            allows_multiple_answers: poll.options.allowsMultipleAnswers,
        });

        await ctx.reply(`Опрос "${ poll.question }" отправлен ✅`);

        if(poll.options.pinPool) {
            const botIsAdmin = await this.botIsAdmin(chatId, ctx.botInfo.id);

            if(botIsAdmin) {
                await this.bot.telegram.pinChatMessage(chatId, msg.message_id);
            } else {
                await ctx.reply("Неудалось закрепить сообщение. Выдайте боту права администратора.");
            }
        }

        await ctx.scene.leave();
    }

    private async botIsAdmin(chatId: number, userId: number) {
        let info = await this.bot.telegram.getChatAdministrators(chatId).catch(() =>{});
        if(!info)
            return;

        return info.findIndex((el) => el.user.id === userId) !== -1;
    }
}
