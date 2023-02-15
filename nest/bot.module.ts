import {Module} from "@nestjs/common";
import {TelegrafModule} from "nestjs-telegraf";
import {PollModule} from "./pool/poll.module";
import {DatabaseModule} from "./database/database.module";
import {session} from "telegraf";
import {CreatePollWizard} from "./pool/scenes/newpoll/createpoll.wizard";
import {KeyboardService} from "./pool/services/keyboard.service";
import {ChatService} from "./pool/services/chat.service";
import {PollService} from "./pool/services/poll.service";
import {NewPollScene} from "./pool/scenes/newpoll.scene";
import {PollUpdate} from "./pool/poll.update";

@Module({
    imports: [
        PollModule,
        DatabaseModule,
        TelegrafModule.forRootAsync({
            useFactory: () => ({
                token: '5374201626:AAEzDLQE3elDKyNUz4oP0cEdagORxdu_8kA',
                middlewares: [session()],
                include: [BotModule],
            }),
        }),
    ],
})
export class BotModule {}
