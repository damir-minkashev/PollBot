import {PollEntity} from "../../common";


export interface AbstractPollService<T> {
    getPollList(chatId: number): Promise<T[]>;
    createPoll(poll: PollEntity): Promise<T>;
    countPoll(chatId: number): Promise<number>;
    getPoll(pollId: string): Promise<T | null>;
    deletePoll(pollId: string): Promise<void>;
}
