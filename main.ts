import {Markup, Telegraf} from "telegraf";
import {config} from "dotenv"
import ChatController from "./controllers/ChatController";
import NewPoolTask from "./app/tasks/NewPoolTask";
import {QueryTypeEnum} from "./app/queries/QueryTypeEnum";
import ChatQueryEntity from "./app/queries/ChatQueryEntity";
import PoolQueryEntity from "./app/queries/PoolQueryEntity";
import SaveQueryEntity from "./app/queries/SaveQueryEntity";
import PoolController from "./controllers/PoolController";

config();

if(!process.env.BOT_TOKEN)
    throw new Error("BOT_TOKEN is empty");

const bot = new Telegraf(process.env.BOT_TOKEN);
const controller = new ChatController();
const poolController = new PoolController();
const taskList = new Map<number, NewPoolTask>();

bot.on("my_chat_member", async (res) => {
    const data = res.update.my_chat_member;

    if (data.chat.type !== "private" && data.new_chat_member.status === "member" )
        await controller.createChat(data.chat.id, data.chat.title);

    if(data.chat.type !== "private" && data.new_chat_member.status === "left")
        await controller.deleteChat(data.chat.id);
});

bot.command("/sendpool", async (ctx) => {
    let chatList = await getValidChatForUser(ctx.message.from.id);
    let buttons = chatList.map(el => Markup.button.callback(el.title, JSON.stringify({chatId: el.id, type: QueryTypeEnum.CHOOSE_CHAT})));

    return ctx.reply(
        'Выберите чат',
        Markup.inlineKeyboard(buttons, {
            columns: 3
        })
    ).then(() => {
        // taskList.set(ctx.message.from.id, new NewPoolTask(poolController));
    })
});

bot.command("/delpool", () => {

});

bot.on("callback_query", async (ctx) => {
    let task = taskList.get(ctx.update.callback_query.from.id);
    if(!task)
        return;

    if(!("data" in ctx.update.callback_query))
        return;

    let data: QueryTypes = JSON.parse(ctx.update.callback_query.data);

    if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
        task.setChatId(data.chatId);
        ctx.reply("Пришлите название опроса");
        return;
    }

    if(data.type === QueryTypeEnum.SAVE_POOL) {
        if(data.flag) {
            await task.store();
            ctx.reply("Опрос сохранен")
        } else {
            ctx.reply("Опрос отменен. Выберите новую команду")
        }

        taskList.delete(ctx.update.callback_query.from.id);
    }

});

bot.command("/newpool", async (ctx) => {
    let chatList = await getValidChatForUser(ctx.message.from.id);
    let buttons = chatList.map(el => Markup.button.callback(el.title, JSON.stringify({chatId: el.id, type: QueryTypeEnum.CHOOSE_CHAT})));

    return ctx.reply(
        'Выберите чат',
        Markup.inlineKeyboard(buttons, {
            columns: 3
        })
    ).then(() => {
        taskList.set(ctx.message.from.id, new NewPoolTask(poolController));
    })
});

bot.command("/done", async (ctx) => {
    let task = taskList.get(ctx.message.from.id);
    if(!task)
        return;

    task.setDone();
    let data = task.getPoolData();
    await ctx.replyWithPoll(data.question, data.answers, {
        is_anonymous:false,
        allows_multiple_answers: true
    })

    let buttons = Markup.inlineKeyboard([
        Markup.button.callback("Сохранить", JSON.stringify({flag: true, type: QueryTypeEnum.SAVE_POOL})),
        Markup.button.callback("Отмена", JSON.stringify({flag: false, type: QueryTypeEnum.SAVE_POOL})),
    ], {
        columns: 3
    });
    ctx.reply("Сохранить опрос?", buttons)
})

bot.on("text", (ctx) => {

    let task = taskList.get(ctx.message.from.id);
    if(!task)
        return;

    if(task.isSetNameState()) {
        task.setName(ctx.message.text);
        ctx.reply("Задайте вопрос");
        return;
    }

    if(task.isSetQuestionState()) {
        task.setQuestion(ctx.message.text);
        ctx.reply("Задайте варианты ответов");
        return;
    }

    if(task.isSetAnswerState()) {
        task.addAnswer(ctx.message.text);
        if(task.countAnswer() <= 10 && task.countAnswer() > 1) {
            ctx.reply("Задайте варианты ответов. Если вы хотите закончить, пришлите /done");
        } else if(task.countAnswer() <= 1) {
            ctx.reply("Вариантов ответов должно быть минимум два. Задайте варианты ответов.");
        } else {
            ctx.reply("Достигнуто максимальное количество ответов. Пришлите /done");
        }

        return;
    }
})

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

type QueryTypes = ChatQueryEntity | PoolQueryEntity | SaveQueryEntity;
