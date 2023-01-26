import {InjectBot, On, Start, Update} from "nestjs-telegraf";
import {Context, Telegraf} from "telegraf";

@Update()
export class PoolUpdate {
    constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

    @Start()
    async onStart(): Promise<string> {
        const me = await this.bot.telegram.getMe();
        console.log(me);
        return `Hey, I'm ${me.first_name}`;
    }

    @On('text')
    onMessage(reversedText: string): string {
        console.log(reversedText);
        return reversedText;
    }
}
