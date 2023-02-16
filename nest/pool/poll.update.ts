import {Command, Ctx, InjectBot, Message, On, Start, Update} from "nestjs-telegraf";
import {Context, Telegraf} from "telegraf";
import {ChatService} from "./services/chat.service";
import {Inject} from "@nestjs/common";
import {SceneContext} from "telegraf/typings/scenes";
import {Update as TUpdate} from 'telegraf/typings/core/types/typegram';

@Update()
export class PollUpdate {
    constructor(@InjectBot() private readonly bot: Telegraf<Context>,
                @Inject(ChatService) private readonly chatService: ChatService) {
        this.bot.telegram.setMyCommands([{
            command: "/showpolls",
            description: "Вывести все опросы",
        }, {
            command: "/newpoll",
            description: "Добавить новый опрос"
        }, {
            command: "/delpoll",
            description: "Удалить опрос"
        }, {
            command: "/sendpoll",
            description: "Отправить опрос"
        }
        ],
  {
            scope: {
                type: "default",
            }
        });
    }

    @Start()
    async onStart(): Promise<string> {
        return "Для начала добавьте бота в чат, куда вы хотите отправлять сообщения и дайте права администратора. Затем создайте опрос /newpool";
    }

    @Command('showpolls')
    async onShowPollCommand(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('showpolls');
    }

    @Command('newpoll')
    async onNewPollCommand(@Ctx() ctx: SceneContext) {
        console.log(ctx.scene.current?.leave );
        // await ctx.scene.current?.leave();
        await ctx.scene.enter('newpoll');
    }

    @On('my_chat_member')
    onAddBotToChat(ctx: Context<TUpdate.MyChatMemberUpdate>) {
        const data = ctx.update.my_chat_member;

        if(data.chat.type === "private")
            return;

        if(data.new_chat_member.status === "member") {
            return this.chatService.createChat(data.chat.id, data.chat.title, data.from.id)
        }

        // Тут момент, если удалить чат, то надо удалять опросы, чтобы бд не засорялась.
        // Но в чат бота можно вернуть.
        // TODO
        if(data.new_chat_member.status === "left") {
            return this.chatService.removeChat(data.chat.id)
        }
    }
}
