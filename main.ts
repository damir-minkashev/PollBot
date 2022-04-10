import {Markup, Telegraf} from "telegraf";
import {config} from "dotenv"
import ChatController from "./controllers/ChatController";
import NewPoolTask from "./app/tasks/NewPoolTask";
import {CallbackQuery} from "typegram";
import {QueryTypeEnum} from "./app/queries/QueryTypeEnum";
import {QueryEntity} from "./app/queries/QueryEntity";
import ChatQueryEntity from "./app/queries/ChatQueryEntity";
import PoolQueryEntity from "./app/queries/PoolQueryEntity";

config();

if(!process.env.BOT_TOKEN)
    throw new Error("BOT_TOKEN is empty");

const bot = new Telegraf(process.env.BOT_TOKEN);
const controller = new ChatController();
const taskList = new Map<number, NewPoolTask>();

bot.action("test 1", (ctx) => {
    console.log("action", ctx.update);
})

bot.on("my_chat_member", async (res) => {
    const data = res.update.my_chat_member;

    if (data.chat.type !== "private" && data.new_chat_member.status === "member" )
        await controller.createChat(data.chat.id, data.chat.title);

    if(data.chat.type !== "private" && data.new_chat_member.status === "left")
        await controller.deleteChat(data.chat.id);
});

bot.command("/sendpool", () => {

});

bot.command("/delpool", () => {

});

bot.on("callback_query", (ctx) => {
    let task = taskList.get(ctx.update.callback_query.from.id);
    if(!task)
        return;

    if(!("data" in ctx.update.callback_query))
        return;

    let data: QueryTypes = JSON.parse(ctx.update.callback_query.data);

    if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
        task.setChatId(data.chatId);
        ctx.reply("Пришлите название опроса");
    }


});


bot.command("/newpool", async (ctx) => {
    let chatList = await getValidChatForUser(ctx.message.from.id);
    let buttons = chatList.map(el => Markup.button.callback(el.title, JSON.stringify({id: el.id, type: QueryTypeEnum.CHOOSE_CHAT})));

    return ctx.reply(
        'Выберите чат',
        Markup.inlineKeyboard(buttons, {
            columns: 3
        })
    ).then(() => {
        taskList.set(ctx.message.from.id, new NewPoolTask(bot));
    })
});

async function getValidChatForUser(userId: number) {
    let chatList = await controller.getChatList();

    let result = [];
    for(let chat of chatList) {
        let member = await checkAccess(chat.id, userId);
        if(!member)
            continue;

        result.push(chat);
    }

    return result;
}

async function checkAccess(chatId: number, userId: number) {
    let info = await bot.telegram.getChatAdministrators(chatId);
    return info.find((el) => {
        return el.user.id === userId;
    })
}

bot.launch();

type QueryTypes = ChatQueryEntity | PoolQueryEntity;
