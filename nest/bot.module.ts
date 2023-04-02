import {Module} from "@nestjs/common";
import {TelegrafModule} from "nestjs-telegraf";
import {PollModule} from "./poll/poll.module";
import {DatabaseModule} from "../infrastructure/database/database.module";
import {session} from "telegraf";
import {checkBotMessage} from "../middlewares/checkBotMessage";



@Module({
    imports: [
        PollModule,
        DatabaseModule,
        TelegrafModule.forRootAsync({
            useFactory: () => ({
                token: process.env.BOT_TOKEN as string,
                middlewares: [session(), checkBotMessage],
                include: [BotModule],
            }),
        }),
    ],
})
export class BotModule {}
