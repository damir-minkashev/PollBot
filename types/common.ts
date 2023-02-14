import {SceneContext} from "telegraf/typings/scenes";

export type SceneContextUpdate<T> = SceneContext & { update: { callback_query: T } }

export type CallbackWithData<T> = T & { data: string };

export enum ButtonTypeEnum {

}
