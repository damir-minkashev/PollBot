import {Command, Ctx, InjectBot, On, Start, Update} from "nestjs-telegraf";
import {Context, Telegraf} from "telegraf";
import {Inject} from "@nestjs/common";
import {SceneContext} from "telegraf/typings/scenes";
import {Update as TUpdate} from 'telegraf/typings/core/types/typegram';
import {ChatService} from "../../services/chat.service";

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

        this.bot.telegram.setMyCommands([], {
            scope: {type:"all_group_chats"}
        })
    }

    @Start()
    async onStart(ctx: Context<TUpdate.MessageUpdate>): Promise<string> {
        const { id } = ctx.update.message.from;
        await this.chatService.updateChatUsers(id);

        return "Для начала добавьте бота в чат, куда вы хотите отправлять сообщения и дайте права администратора. Если бот уже присутствует в чате, то ничего дополнительно делать не нужно. " +
            "Также для вас доступны чаты, в которых вы являетесь администратором. Для того, чтобы создать опрос введите /newpoll";
    }

    @Command('showpolls')
    async onShowPollCommand(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('showpolls');
    }

    @Command('newpoll')
    async onNewPollCommand(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('newpoll');
    }

    @Command('delpoll')
    async onDelPollCommand(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('delpoll');
    }

    @Command('sendpoll')
    async onSendPollCommand(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter('sendpoll');
    }

    @On('my_chat_member')
    onAddBotToChat(ctx: Context<TUpdate.MyChatMemberUpdate>) {
        const data = ctx.update.my_chat_member;

        if(data.chat.type === "private")
            return;

        if(data.new_chat_member.status === "member") {
            this.chatService.createChat(data.chat.id, data.chat.title, data.from.id)
        }

        if(data.new_chat_member.status === "left") {
            this.chatService.removeChat(data.chat.id)
        }
    }
}
