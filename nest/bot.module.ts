import {Module} from "@nestjs/common";
import {TelegrafModule} from "nestjs-telegraf";
import {PollModule} from "./pool/poll.module";
import {DatabaseModule} from "./database/database.module";
import {session} from "telegraf";

@Module({
    imports: [
        TelegrafModule.forRoot({
            token: '5374201626:AAEzDLQE3elDKyNUz4oP0cEdagORxdu_8kA',
            middlewares: [session()],
            include: [PollModule],
        }),
        PollModule,
        DatabaseModule
    ],
})
export class BotModule {}
