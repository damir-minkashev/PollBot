import {Inject, Injectable} from "@nestjs/common";
import {Context, Markup, Telegraf} from "telegraf";
import {ChatService} from "./chat.service";
import {PollService} from "./poll.service";
import {Ctx, InjectBot} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";

@Injectable()
export class KeyboardService {

    constructor(@InjectBot() private readonly bot: Telegraf<Context>,
                @Inject(ChatService) private readonly chatService: ChatService,
                @Inject(PollService) private readonly pollService: PollService) {}

    async showChatKeyboard(@Ctx() context: Context, id: number){
        const chatList = await this.chatService.getChatList(id);
        let buttons = chatList.map(el =>
            Markup.button.callback(el.title, `showchats:${JSON.stringify({chatId: el.chatId})}`));

        if(buttons.length === 0)
            return "Нет доступных чатов. Сначала добавьте бота в чат, в который вы хотите публиковать опросы. " +
                "Вы также должны обладать правами администратора."

        await context.reply(
            'Выберите чат',
            Markup.inlineKeyboard(buttons, {
                columns: 4
            })
        );
    }

    async showPollKeyboard(@Ctx() context: SceneContext, chatId: number){
        const polls = await this.pollService.getPollList(chatId);

        let buttons = polls.map(el =>
            Markup.button.callback(el.command, `showpoll:${JSON.stringify({id: el._id})}`));

        if(buttons.length === 0)
            return "Для этого чата нет созданных опросов. Отправьте /newpoll, чтобы создать новый опрос.";

        await context.reply(
            'Выберите опрос',
            Markup.inlineKeyboard(buttons, {
                columns: 3
            })
        );
    }

    async showPollSettingsKeyboard(@Ctx() context: Context) {
        // TODO Enum
        await context.reply("Выберите дополнительные настройки", Markup.inlineKeyboard([
                Markup.button.callback("📌 Закрепить", `polloption:pinPool`),
                Markup.button.callback("🗓 Доп. текст опроса", 'polloption:addTimeToTitle'),
                Markup.button.callback("Сохранить", 'polloption:save'),
                Markup.button.callback("Отмена", 'polloption:cancel'),
            ], {
                columns:2
            }));
    }

    async hideKeyboard(@Ctx() context: Context) {
        await context.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as any);
    }
}
