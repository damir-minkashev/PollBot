import {Ctx, On, Scene, SceneEnter, Sender} from "nestjs-telegraf";
import {SceneContext} from "telegraf/typings/scenes";
import {Markup} from "telegraf";
import {ChatService} from "../../services/chat.service";
import {QueryTypeEnum} from "../../../../app/queries/QueryTypeEnum";
import {Inject} from "@nestjs/common";

@Scene('showpolls')
export class ShowPollScene {
    constructor(@Inject(ChatService) private readonly chatService: ChatService) {}


    @SceneEnter()
    async onSceneEnter(@Ctx() context: SceneContext,
                       @Sender('id') id: number) {
        const chatList = await this.chatService.getChatList(id);
        let buttons = chatList.map(el => Markup.button.callback(el.title, JSON.stringify({chatId: el.chatId, type: QueryTypeEnum.CHOOSE_CHAT})));

        await context.reply(
        'Выберите чат',
            Markup.inlineKeyboard(buttons, {
                columns: 4
            })
        );
    }

    @On('callback_query')
    async onChooseChat(ctx: any){
        console.log('answeeer', ctx);
    }
}
