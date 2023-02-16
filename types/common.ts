import {SceneContext} from "telegraf/typings/scenes";
import {Poll} from "../models/types/pool";

export type SceneContextUpdate<T> = SceneContext & { update: { callback_query: T } }

export type CallbackWithData<T> = T & { data: string };

export type PollEntity = Omit<Poll, '_chat'> & { chatId: number};
