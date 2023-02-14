import {Module} from "@nestjs/common";
import {PollUpdate} from "./poll.update";
import {ChatService} from "./services/chat.service";
import {ShowPollScene} from "./scenes/showpoll.scene";
import {PollService} from "./services/poll.service";
import {KeyboardService} from "./services/keyboard.service";
import {NewPollScene} from "./scenes/newpoll.scene";

@Module({
    providers: [PollUpdate, KeyboardService, ChatService, PollService, ShowPollScene, NewPollScene],
})
export class PollModule {}
