import {Context, Markup, Telegraf} from "telegraf";
import {config} from "dotenv"
import ChatController from "./controllers/ChatController";
import NewPoolTask from "./app/tasks/NewPoolTask";
import {QueryTypeEnum} from "./app/queries/QueryTypeEnum";
import ChatQueryEntity from "./app/queries/ChatQueryEntity";
import PoolQueryEntity from "./app/queries/PoolQueryEntity";
import SaveQueryEntity from "./app/queries/SaveQueryEntity";
import PoolController from "./controllers/PoolController";
import {Update} from "typegram";
import SendPoolTask from "./app/tasks/SendPoolTask";
import DelPoolTask from "./app/tasks/DelPoolTask";
import ShowPoolsTask from "./app/tasks/ShowPoolsTask";

config();

// if(!process.env.BOT_TOKEN)
//     throw new Error("BOT_TOKEN is empty");

const bot = new Telegraf("5237809364:AAEjk5by7hzYGNIPfP26ovo4LETTgeE4iDM");
const controller = new ChatController();
const poolController = new PoolController();
const taskList = new Map<number, TaskTypes>();


bot.on("my_chat_member", async (res) => {
    const data = res.update.my_chat_member;

    if (data.chat.type !== "private" && data.new_chat_member.status === "member" )
        await controller.createChat(data.chat.id, data.chat.title);

    if(data.chat.type !== "private" && data.new_chat_member.status === "left")
        await controller.deleteChat(data.chat.id);
});

bot.command("/sendpool", async (ctx) => {
    sendChatKeyboard(ctx).then(() => {
        taskList.set(ctx.message.from.id, new SendPoolTask(poolController));
    });
});

bot.command("/delpool", (ctx) => {
    sendChatKeyboard(ctx).then(() => {
        taskList.set(ctx.message.from.id, new DelPoolTask(poolController));
    });
});

bot.command("/showpools", (ctx) => {
    sendChatKeyboard(ctx).then(() => {
        taskList.set(ctx.message.from.id, new ShowPoolsTask(poolController));
    });
});

bot.command("/newpool", async (ctx) => {
    sendChatKeyboard(ctx).then(() => {
        taskList.set(ctx.message.from.id, new NewPoolTask(poolController));
    })
});


bot.command("/done", async (ctx) => {
    let task = taskList.get(ctx.message.from.id);
    if(!task)
        return;

    if(!(task instanceof NewPoolTask))
        return;

    task.setDone();
    let data = task.getPoolData();
    await ctx.replyWithPoll(data.question, data.answers, {
        is_anonymous:false,
        allows_multiple_answers: true
    });

    let buttons = Markup.inlineKeyboard([
        Markup.button.callback("Сохранить", JSON.stringify({flag: true, type: QueryTypeEnum.SAVE_POOL})),
        Markup.button.callback("Отмена", JSON.stringify({flag: false, type: QueryTypeEnum.SAVE_POOL})),
    ], {
        columns: 3
    });
    ctx.reply("Сохранить опрос?", buttons)
})

bot.on("callback_query", async (ctx) => {
    let task = taskList.get(ctx.update.callback_query.from.id);
    if(!task)
        return;

    if(!("data" in ctx.update.callback_query))
        return;
    await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
    let data: QueryTypes = JSON.parse(ctx.update.callback_query.data);
    if(task instanceof NewPoolTask) {
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
        return;
    }
    if(task instanceof SendPoolTask) {
        if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
            task.setChatId(data.chatId);
            return sendChoosePool(data.chatId, ctx);
        }

        if(data.type === QueryTypeEnum.CHOOSE_POOL) {
            let pool = await task.getPool(data.poolId);
            if(pool)
                return bot.telegram.sendPoll(pool.chat_id, pool.question, pool.answers, {
                    is_anonymous: pool.options.isAnonymous,
                    allows_multiple_answers: pool.options.allowsMultipleAnswers,
                }).then(async (msg) => {
                    if(pool?.options.pinPool) {
                        let chatId = +pool.chat_id;
                        checkAccess(chatId, ctx.botInfo.id).then((res) => {
                            res ? bot.telegram.pinChatMessage(chatId, msg.message_id) : undefined;
                        })
                    }
                    taskList.delete(ctx.update.callback_query.from.id);
                })
        }
        return;
    }

    if(task instanceof DelPoolTask) {
        if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
            task.setChatId(data.chatId);
            return sendChoosePool(data.chatId, ctx);
        }

        if(data.type === QueryTypeEnum.CHOOSE_POOL) {
            task.deletePool(data.poolId);
            taskList.delete(ctx.update.callback_query.from.id);
            return ctx.reply("Опрос удален")
        }
        return;
    }

    if(task instanceof ShowPoolsTask) {
        if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
            task.setChatId(data.chatId);
            return sendChoosePool(data.chatId, ctx);
        }

        if(data.type === QueryTypeEnum.CHOOSE_POOL) {
            let pool = await task.getPool(data.poolId);
            if(pool)
                return ctx.replyWithPoll(pool.question, pool.answers, {
                    is_anonymous: pool.options.isAnonymous,
                    allows_multiple_answers: pool.options.allowsMultipleAnswers,
                }).then(() => {
                    taskList.delete(ctx.update.callback_query.from.id);
                })
        }
        return;
    }

});

bot.on("text", (ctx) => {

    let task = taskList.get(ctx.message.from.id);
    if(!task)
        return;

    if(!(task instanceof NewPoolTask))
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
});

async function sendChatKeyboard(ctx: Context<Update>) {
    if(!ctx.message)
        return;

    let chatList = await getValidChatForUser(ctx.message.from.id);
    let buttons = chatList.map(el => Markup.button.callback(el.title, JSON.stringify({chatId: el.id, type: QueryTypeEnum.CHOOSE_CHAT})));

    if(buttons.length === 0)
        return ctx.reply("Нет доступных чатов. Сначала добавьте бота в чат, в который вы хотите публиковать опросы. " +
            "Вы также должны обладать правами администратора.");

    return ctx.reply(
        'Выберите чат',
        Markup.inlineKeyboard(buttons, {
            columns: 4
        })
    )
}

async function sendChoosePool(chatId: number, ctx: Context) {
    let poolList = await poolController.getPoolList(chatId);
    let buttons = poolList.map(el => Markup.button.callback(el.command, JSON.stringify({poolId: el.id, type: QueryTypeEnum.CHOOSE_POOL})));

    if(buttons.length === 0)
        return ctx.reply("Для этого чата нет созданных опросов. Отправьте /newpool, чтобы создать новый опрос.");

    return ctx.reply("Выберите опрос", Markup.inlineKeyboard(buttons, {
        columns: 4,
    }));
}

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

bot.telegram.setMyCommands([{
    command: "/showpools",
    description: "Вывести все опросы",
}, {
    command: "/newpool",
    description: "Добавить новый опрос"
}, {
    command: "/delpool",
    description: "Удалить опрос"
}, {
    command: "/sendpool",
    description: "Отправить опрос"
}
]).then(() => bot.launch());

// bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

type QueryTypes = ChatQueryEntity | PoolQueryEntity | SaveQueryEntity;

type TaskTypes = NewPoolTask | SendPoolTask | DelPoolTask | ShowPoolsTask;
