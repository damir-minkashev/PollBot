import {Module} from "@nestjs/common";
import {PollUpdate} from "./poll.update";
import {ChatService} from "./services/chat.service";
import {ShowPollScene} from "./scenes/showpool/showpoll.scene";

@Module({
    providers: [PollUpdate, ChatService, ShowPollScene],
})
export class PollModule {}
