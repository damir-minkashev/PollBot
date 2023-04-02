import {SceneContext} from "telegraf/typings/scenes";
import {PollData} from "./data/PollData";


export type SceneContextUpdate<T> = SceneContext & { update: { callback_query: T } }

export type CallbackWithData<T> = T & { data: string };

export type PollEntity = Omit<PollData<unknown>, '_chat'> & { chatId: number};
