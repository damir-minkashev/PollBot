import {Module} from "@nestjs/common";
import {PollUpdate} from "./poll.update";
import {ShowPollScene} from "./scenes/showpoll.scene";
import {KeyboardService} from "./services/keyboard.service";
import {NewPollScene} from "./scenes/newpoll/newpoll.scene";
import {CreatePollWizard} from "./scenes/newpoll/createpoll.wizard";
import {SendPollScene} from "./scenes/sendpoll.scene";
import {DelPollScene} from "./scenes/delpoll.scene";
import {ChatService} from "../../services/chat.service";
import {PollService} from "../../services/poll.service";

@Module({
    providers: [PollUpdate,
        ChatService, PollService, KeyboardService, ShowPollScene, NewPollScene, CreatePollWizard, SendPollScene, DelPollScene],
})
export class PollModule {}
