import {Telegraf, Markup} from "telegraf";
import {config} from "dotenv"
import ChatController from "./controllers/ChatController";

config();

if(!process.env.BOT_TOKEN)
    throw new Error("BOT_TOKEN is empty");

const bot = new Telegraf(process.env.BOT_TOKEN);
const controller = new ChatController();

bot.on("my_chat_member", async (res) => {
    const data = res.update.my_chat_member;

    if (data.chat.type !== "private" && data.new_chat_member.status === "member" )
        await controller.createChat(data.chat.id, data.chat.title);

    if(data.chat.type !== "private" && data.new_chat_member.status === "left")
        await controller.deleteChat(data.chat.id);
});

bot.command("/newpool", async (ctx) => {
    let chatList = await controller.getChatList();
    let buttons = chatList.map( el => ({text: el.title, id: el.id}));

    return ctx.reply(
        'Выберите проект',
        Markup.keyboard(buttons).resize()
    )
});



bot.launch();

