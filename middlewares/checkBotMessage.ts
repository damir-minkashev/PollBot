import {Context} from "telegraf";
import {Update as TUpdate} from 'telegraf/typings/core/types/typegram';

export async function checkBotMessage(ctx: Context<TUpdate.MessageUpdate>, next: () => Promise<void>) {
    if(!ctx.update.message) {
        return await next();
    }

    const { from, chat } = ctx.update.message;

    // skip commands from chat where bot using
    if(from.id !== chat.id) {
        return;
    }

    return await next();
}
