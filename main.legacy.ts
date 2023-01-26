// import {Context, Markup, Telegraf} from "telegraf";
// import {config as dotenv} from "dotenv"
// import ChatController from "./controllers/ChatController";
// import NewPoolTask, {PoolData} from "./app/tasks/NewPoolTask";
// import {QueryTypeEnum} from "./app/queries/QueryTypeEnum";
// import ChatQueryEntity from "./app/queries/ChatQueryEntity";
// import PoolQueryEntity from "./app/queries/PoolQueryEntity";
// import SaveQueryEntity from "./app/queries/SaveQueryEntity";
// import PoolController from "./controllers/PoolController";
// import {Update} from "typegram";
// import SendPoolTask from "./app/tasks/SendPoolTask";
// import DelPoolTask from "./app/tasks/DelPoolTask";
// import ShowPoolsTask from "./app/tasks/ShowPoolsTask";
// import {PoolOptionQueryCustom, PoolOptionQueryDefault, PoolOptionQueryTypes} from "./app/queries/PoolOptionQueryEntity";
// import {PoolOptionsSchema} from "./schema/PoolOptionsSchema";
// import connection from "./mongo";
// import config from "./config.json" assert { type: 'json' };
// import {PoolDocument} from "./models/types/pool";
// import Pool from "./models/Pool";
// import {ChatDocument} from "./models/types/chat";
//
// dotenv();
//
// if(!process.env.BOT_TOKEN)
//     throw new Error("BOT_TOKEN is empty");
//
// const bot = new Telegraf(process.env.BOT_TOKEN);
//
// await connection(config.mongodb.uri);
//
// const controller = new ChatController();
// const poolController = new PoolController();
// const taskList = new Map<number, TaskTypes>();
//
// await bot.telegram.setMyCommands([{
//     command: "/showpools",
//     description: "Вывести все опросы",
// }, {
//     command: "/newpool",
//     description: "Добавить новый опрос"
// }, {
//     command: "/delpool",
//     description: "Удалить опрос"
// }, {
//     command: "/sendpool",
//     description: "Отправить опрос"
// }
// ], {
//     scope: {
//         type: "default",
//     }
// });
//
// await bot.telegram.setMyCommands([], {
//     scope: {type:"all_group_chats"}
// })
//
// bot.on("my_chat_member", async (res) => {
//     const data = res.update.my_chat_member;
//
//     if (data.chat.type !== "private" && data.new_chat_member.status === "member" )
//         await controller.createChat(data.chat.id, data.chat.title);
//
//     if(data.chat.type !== "private" && data.new_chat_member.status === "left")
//         await controller.deleteChat(data.chat.id);
// });
//
// bot.command("/start", (ctx) => {
//     if(ctx.message.chat.type !== "private")
//         return;
//
//     ctx.reply("Для начала добавьте бота в чат, куда вы хотите отправлять сообщения и дайте права администратора. Затем создайте опрос /newpool")
// })
//
// bot.command("/sendpool", async (ctx) => {
//     if(ctx.message.chat.type !== "private")
//         return;
//
//     sendChatKeyboard(ctx).then(() => {
//         taskList.set(ctx.message.from.id, new SendPoolTask(poolController));
//     });
// });
//
// bot.command("/delpool", (ctx) => {
//     if(ctx.message.chat.type !== "private")
//         return;
//
//     sendChatKeyboard(ctx).then(() => {
//         taskList.set(ctx.message.from.id, new DelPoolTask(poolController));
//     });
// });
//
// bot.command("/showpools", (ctx) => {
//     if(ctx.message.chat.type !== "private")
//         return;
//
//     sendChatKeyboard(ctx).then(() => {
//         taskList.set(ctx.message.from.id, new ShowPoolsTask(poolController));
//     });
// });
//
// bot.command("/newpool", async (ctx) => {
//     if(ctx.message.chat.type !== "private")
//         return;
//
//     sendChatKeyboard(ctx).then(() => {
//         taskList.set(ctx.message.from.id, new NewPoolTask(poolController));
//     })
// });
//
//
// bot.command("/done", async (ctx) => {
//     if(ctx.message.chat.type !== "private")
//         return;
//
//     let task = taskList.get(ctx.message.from.id);
//     if(!task)
//         return;
//
//     if(!(task instanceof NewPoolTask))
//         return;
//
//     if(task.isSetAnswerState()) {
//         task.setDone();
//         return ctx.reply("Выберите настройки", Markup.inlineKeyboard([
//             Markup.button.callback("📌 Закрепить", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "pinPool", value: true} as PoolOptionQueryCustom)),
//             Markup.button.callback("🥷🏻 Анонимно", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "isAnonymous", value: true} as PoolOptionQueryCustom)),
//             Markup.button.callback("☑ Несколько ответов", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "allowsMultipleAnswers", value: true} as PoolOptionQueryCustom)),
//             Markup.button.callback("🗓 Добавить дату", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, key: "addTimeToTitle", value: true} as PoolOptionQueryCustom)),
//             Markup.button.callback("📌 ☑ 🗓 По умолчанию", JSON.stringify({type: QueryTypeEnum.CHOOSE_OPTION, default: true} as PoolOptionQueryDefault)),
//         ], {
//             columns:2
//         }));
//     }
// })
//
// bot.on("callback_query", async (ctx) => {
//     let task = taskList.get(ctx.update.callback_query.from.id);
//     if(!task)
//         return;
//
//     if(!("data" in ctx.update.callback_query))
//         return;
//
//     let data: QueryTypes = JSON.parse(ctx.update.callback_query.data);
//     if(task instanceof NewPoolTask) {
//         if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
//             await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
//             task.setChatId(data.chatId);
//             ctx.reply("Пришлите название опроса");
//             return;
//         }
//
//         if(data.type === QueryTypeEnum.CHOOSE_OPTION) {
//             if(data.default) {
//                 task.setDefaultOption();
//                 return admitPool(ctx, task.getPoolData());
//             }
//
//             task.setOption(data.key, data.value);
//             return choosePoolOption(ctx, data.key);
//         }
//
//         if(data.type === QueryTypeEnum.SAVE_POOL) {
//             await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
//             if(data.flag) {
//                 await task.store();
//                 ctx.reply("Опрос сохранен")
//             } else {
//                 ctx.reply("Опрос отменен. Выберите новую команду")
//             }
//
//             taskList.delete(ctx.update.callback_query.from.id);
//         }
//         return;
//     }
//     if(task instanceof SendPoolTask) {
//         await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
//         if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
//             task.setChatId(data.chatId);
//             return sendChoosePool(data.chatId, ctx);
//         }
//
//         if(data.type === QueryTypeEnum.CHOOSE_POOL) {
//             let pool = await task.getPool(data.poolId);
//             if(!pool)
//                 return;
//
//             if(!pool.options.addTimeToTitle) {
//                 taskList.delete(ctx.update.callback_query.from.id);
//                 return sendPoolToChat(ctx, pool);
//             } else {
//                 task.setPoolId(data.poolId);
//                 ctx.reply("Пришлите дату.");
//             }
//         }
//         return;
//     }
//
//     if(task instanceof DelPoolTask) {
//         await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
//         if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
//             task.setChatId(data.chatId);
//             return sendChoosePool(data.chatId, ctx);
//         }
//
//         if(data.type === QueryTypeEnum.CHOOSE_POOL) {
//             task.deletePool(data.poolId);
//             taskList.delete(ctx.update.callback_query.from.id);
//             return ctx.reply("Опрос удален")
//         }
//         return;
//     }
//
//     if(task instanceof ShowPoolsTask) {
//         await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
//         if(data.type === QueryTypeEnum.CHOOSE_CHAT) {
//             task.setChatId(data.chatId);
//             return sendChoosePool(data.chatId, ctx);
//         }
//
//         if(data.type === QueryTypeEnum.CHOOSE_POOL) {
//             let pool = await task.getPool(data.poolId);
//             if(pool)
//                 return ctx.replyWithPoll(pool.question, pool.answers, {
//                     is_anonymous: pool.options.isAnonymous,
//                     allows_multiple_answers: pool.options.allowsMultipleAnswers,
//                 }).then(() => {
//                     taskList.delete(ctx.update.callback_query.from.id);
//                 })
//         }
//         return;
//     }
//
// });
//
// bot.on("text", async (ctx) => {
//
//     let task = taskList.get(ctx.message.from.id);
//     if(!task)
//         return;
//
//     if(task instanceof NewPoolTask) {
//         if(task.isSetNameState()) {
//             task.setName(ctx.message.text);
//             ctx.reply("Задайте вопрос");
//             return;
//         }
//
//         if(task.isSetQuestionState()) {
//             task.setQuestion(ctx.message.text);
//             ctx.reply("Задайте варианты ответов");
//             return;
//         }
//
//         if(task.isSetAnswerState()) {
//             task.addAnswer(ctx.message.text);
//             if(task.countAnswer() <= 10 && task.countAnswer() > 1) {
//                 ctx.reply("Задайте варианты ответов. Если вы хотите закончить, пришлите /done");
//             } else if(task.countAnswer() <= 1) {
//                 ctx.reply("Вариантов ответов должно быть минимум два. Задайте варианты ответов.");
//             } else {
//                 ctx.reply("Достигнуто максимальное количество ответов. Пришлите /done");
//             }
//
//             return;
//         }
//     }
//
//     if(task instanceof SendPoolTask) {
//         const pool = await task.getPool(task.poolId);
//         if(pool) {
//             pool.question = ctx.message.text + " " + pool.question;
//             taskList.delete(ctx.message.from.id);
//             await sendPoolToChat(ctx, pool);
//             ctx.reply(`✅ Опрос ${ pool.question } отправлен`);
//         }
//
//     }
// });
//
// async function sendChatKeyboard(ctx: Context<Update>) {
//     if(!ctx.message)
//         return;
//
//     let chatList = await getValidChatForUser(ctx.message.from.id);
//     let buttons = chatList.map(el => Markup.button.callback(el.title, JSON.stringify({chatId: el.chatId, type: QueryTypeEnum.CHOOSE_CHAT})));
//
//     if(buttons.length === 0)
//         return ctx.reply("Нет доступных чатов. Сначала добавьте бота в чат, в который вы хотите публиковать опросы. " +
//             "Вы также должны обладать правами администратора.");
//
//     return ctx.reply(
//         'Выберите чат',
//         Markup.inlineKeyboard(buttons, {
//             columns: 4
//         })
//     )
// }
//
// async function sendChoosePool(chatId: number, ctx: Context) {
//     let poolList = await poolController.getPoolList(chatId);
//     let buttons = poolList.map(el => Markup.button.callback(el.command, JSON.stringify({poolId: el._id, type: QueryTypeEnum.CHOOSE_POOL})));
//
//     if(buttons.length === 0)
//         return ctx.reply("Для этого чата нет созданных опросов. Отправьте /newpool, чтобы создать новый опрос.");
//
//     return ctx.reply("Выберите опрос", Markup.inlineKeyboard(buttons, {
//         columns: 4,
//     }));
// }
//
// async function choosePoolOption(ctx: Context, key: keyof PoolOptionsSchema) {
//     switch (key) {
//         case "addTimeToTitle":
//             return ctx.reply("✅ Добавить дату в опрос. Чтобы закончить, нажмите /done.");
//         case "pinPool":
//             return ctx.reply("✅ Закрепить опрос. Чтобы закончить, нажмите /done.");
//         case "allowsMultipleAnswers":
//             return ctx.reply("✅ Добавлен мультиселект. Чтобы закончить, нажмите /done.");
//         case "isAnonymous":
//             return ctx.reply("✅ Сделать опрос анонимным. Чтобы закончить, нажмите /done.");
//     }
// }
//
// /**
//  *
//  * @param ctx
//  * @param data
//  */
// async function admitPool(ctx: Context, data: PoolData) {
//     await ctx.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as  any)
//     await ctx.replyWithPoll(data.question, data.answers, {
//         is_anonymous: data.options.isAnonymous,
//         allows_multiple_answers: data.options.allowsMultipleAnswers,
//     });
//
//     let buttons = Markup.inlineKeyboard([
//         Markup.button.callback("Сохранить", JSON.stringify({flag: true, type: QueryTypeEnum.SAVE_POOL})),
//         Markup.button.callback("Отмена", JSON.stringify({flag: false, type: QueryTypeEnum.SAVE_POOL})),
//     ], {
//         columns: 3
//     });
//     return ctx.reply("Сохранить опрос?", buttons);
// }
//
// async function sendPoolToChat(ctx: Context, pool: PoolDocument) {
//     await Pool.populate(pool, '_chat');
//     const chat = pool._chat as ChatDocument;
//
//     return bot.telegram.sendPoll(chat.chatId, pool.question, pool.answers, {
//         is_anonymous: pool.options.isAnonymous,
//         allows_multiple_answers: pool.options.allowsMultipleAnswers,
//     }).then(async (msg) => {
//         if(pool?.options.pinPool) {
//             let chatId = +chat.chatId;
//             checkAccess(chatId, ctx.botInfo.id).then((res) => {
//                 res ? bot.telegram.pinChatMessage(chatId, msg.message_id) : undefined;
//             })
//         }
//     })
// }
//
// async function getValidChatForUser(userId: number) {
//     let chatList = await controller.getChatList();
//
//     let result = [];
//     for(let chat of chatList) {
//         let member = await checkAccess(chat.chatId, userId);
//         if(!member)
//             continue;
//
//         result.push(chat);
//     }
//
//     return result;
// }
//
// async function checkAccess(chatId: number, userId: number) {
//     let info = await bot.telegram.getChatAdministrators(chatId).catch(() =>{});
//     if(!info)
//         return ;
//
//     return info.find((el) => {
//         return el.user.id === userId;
//     })
// }
//
// bot.launch();
// // process.once('SIGINT', () => bot.stop('SIGINT'))
// // process.once('SIGTERM', () => bot.stop('SIGTERM'))
//
// process.on("uncaughtException", (e) => {
//     console.log(e);
// });
//
// type QueryTypes = ChatQueryEntity | PoolQueryEntity | SaveQueryEntity | PoolOptionQueryTypes;
//
// type TaskTypes = NewPoolTask | SendPoolTask | DelPoolTask | ShowPoolsTask;
